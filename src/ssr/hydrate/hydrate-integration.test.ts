import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { List } from "../../components/list";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { GLOBAL_STATE_FEATURE_ID } from "../../state/feature";
import { useState } from "../../state/use-state";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { clearHydrationData, hydrate } from "./index";

describe("Hydration Integration", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    // We start in a clean state, not in client mode yet for SSR.
    container = document.createElement("div");
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    if (cleanupClientMode) {
      cleanupClientMode();
    }
  });

  const TestApp = () => {
    const [count, setCount] = useState("count", 0);
    const [title] = useState("title", "My App");
    const items = new Seidr([1, 2, 3]);

    return $("div", { id: "app" }, [
      $("h1", { id: "title", textContent: title }),
      $("p", { id: "desc", textContent: count.as((c) => `Count: ${c}`) }),
      $("button", {
        id: "increment",
        onclick: () => setCount(count.value + 1),
      }),
      $("ul", null, [
        List(
          items,
          (item) => String(item),
          (item) => $("li", { textContent: `Item ${item}` }),
        ),
      ]),
    ]);
  };

  it("should natively reuse existing DOM nodes on successful hydration", async () => {
    // 1. SSR Pass
    const { html, hydrationData } = await renderToString(TestApp);

    // 2. Client Setup
    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // Grab references to the raw DOM nodes before hydration
    const originalAppDiv = container.querySelector("#app");
    const originalH1 = container.querySelector("h1");
    const originalButton = container.querySelector("button");
    const originalListItems = container.querySelectorAll("li");

    expect(originalAppDiv).toBeDefined();
    expect(originalH1?.textContent).toBe("My App");
    expect(originalListItems.length).toBe(3);

    // 3. Hydrate
    unmount = hydrate(TestApp, container, hydrationData);

    // 4. Verify Identity (nodes should not have changed references)
    const hydratedAppDiv = container.querySelector("#app");
    const hydratedH1 = container.querySelector("h1");
    const hydratedButton = container.querySelector("button");

    expect(hydratedAppDiv).toBe(originalAppDiv); // Same exact DOM node!
    expect(hydratedH1).toBe(originalH1);
    expect(hydratedButton).toBe(originalButton);
    expect(container.querySelectorAll("li").length).toBe(3);

    // 5. Verify Reactivity & Events
    hydratedButton?.click();
    expect(container.querySelector("#desc")?.textContent).toBe("Count: 1");
  });

  it("should bail out if there is a DOM mismatch (e.g. text difference)", async () => {
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // Mutate the HTML to create a mismatch
    const h1 = container.querySelector("h1");
    if (h1) h1.textContent = "Tampered Title";

    // Re-hydrate
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    unmount = hydrate(TestApp, container, hydrationData);

    // It should have logged a warning and replaced the tampered elements
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Hydration mismatch"));

    // The framework should correct it back to the client expected state
    expect(container.querySelector("h1")?.textContent).toBe("My App");

    consoleWarnSpy.mockRestore();
  });

  it("should bail out if there is a tag mismatch", async () => {
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // Mutate the HTML to create a severe tag mismatch
    const appDiv = container.querySelector("#app");
    if (appDiv) {
      // replace h1 with h2
      appDiv.innerHTML = appDiv.innerHTML.replace("<h1", "<h2").replace("</h1>", "</h2>");
    }

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    unmount = hydrate(TestApp, container, hydrationData);

    // Should detect the difference between h1 and h2
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Hydration mismatch"));

    // The framework should gracefully fallback to client rendering and recreate the h1
    expect(container.querySelector("h1")).toBeTruthy();
    expect(container.querySelector("h1")?.textContent).toBe("My App");
    expect(container.querySelector("h2")).toBeNull();

    consoleWarnSpy.mockRestore();
  });

  it("should work even if hydration data state is modified", async () => {
    // SSR output renders "My App"
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // We deliberately alter the server state to something else before hydration
    if (hydrationData.features) {
      hydrationData.features[GLOBAL_STATE_FEATURE_ID].title = "Modified App Title";
    }

    // Since the client receives this modified hydration state, the component will render with this new state
    unmount = hydrate(TestApp, container, hydrationData);

    // We expect the DOM to be smoothly updated to reflect the new state, rather than crashing
    expect(container.querySelector("h1")?.textContent).toBe("Modified App Title");
  });
});
