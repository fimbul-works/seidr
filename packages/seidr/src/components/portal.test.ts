import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent } from "../component/create-component.js";
import { getDocument } from "../dom/get-document.js";
import { mount } from "../dom/mount.js";
import { $ } from "../element/create-element.js";
import { onMounted } from "../hooks/on-mounted.js";
import { onUnmounted } from "../hooks/on-unmounted.js";
import type { Value } from "../observable/types.js";
import { createValue } from "../observable/value.js";
import { hydrate } from "../ssr/hydrate/hydrate.js";
import { renderToString } from "../ssr/render-to-string.js";
import { enableClientMode } from "../test-setup/client-mode.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import { enableSSRMode } from "../test-setup/ssr-mode.js";
import type { CleanupFunction } from "../types.js";
import { lazy } from "./lazy.js";
import { List } from "./list.js";
import { Portal } from "./portal.js";
import { Show } from "./show.js";
import { Suspense, type SuspenseState } from "./suspense.js";
import { Switch } from "./switch.js";

describeDualMode("Portal Component", ({ getDocument, isSSR }) => {
  let container: HTMLDivElement;
  let portalTarget: HTMLDivElement;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    container.id = "app-container";
    portalTarget = doc.createElement("div");
    portalTarget.id = "portal-target";
    doc.body.appendChild(container);
    doc.body.appendChild(portalTarget);
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    container?.remove();
    portalTarget?.remove();
  });

  it("should render content into portalTarget instead of container and clean up on unmount", () => {
    const App = () =>
      $("div", { className: "source-wrapper" }, [
        $("span", { textContent: "In Source" }),
        Portal(portalTarget, () => $("div", { className: "portaled", textContent: "In Portal" })),
      ]);

    unmount = mount(App, container);

    expect(container.textContent).toBe("In Source");
    expect(container.querySelector(".portaled")).toBeNull();
    expect(portalTarget.querySelector(".portaled")).not.toBeNull();
    expect(portalTarget.textContent).toBe("In Portal");

    unmount();
    unmount = undefined;

    expect(portalTarget.querySelector(".portaled")).toBeNull();
    expect(portalTarget.textContent).toBe("");
  });

  it("should fire child onMounted after nodes are attached inside portalTarget", () => {
    let parentDuringMount: HTMLElement | null = null;
    const unmountedSpy = vi.fn();

    const Child = createComponent(() => {
      const el = $("div", { className: "child", textContent: "Mounted Child" });
      onMounted(() => {
        parentDuringMount = el.parentElement;
      });
      onUnmounted(unmountedSpy);
      return el;
    });

    unmount = mount(() => Portal(portalTarget, Child), container);

    expect(parentDuringMount).toBe(portalTarget);
    expect(unmountedSpy).not.toHaveBeenCalled();

    unmount();
    unmount = undefined;

    expect(unmountedSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle click and input events inside Portal", () => {
    if (isSSR) return;

    const count = createValue(0);
    const text = createValue("");

    const App = () =>
      Portal(portalTarget, () =>
        $("div", { className: "modal" }, [
          $("button", {
            className: "btn",
            onclick: () => count(count() + 1),
            textContent: count.as((c) => `Clicks: ${c}`),
          }),
          $("input", {
            className: "inp",
            oninput: (e: Event) => text((e.target as HTMLInputElement).value),
          }),
        ]),
      );

    unmount = mount(App, container);

    const btn = portalTarget.querySelector(".btn") as HTMLButtonElement;
    const inp = portalTarget.querySelector(".inp") as HTMLInputElement;
    expect(btn).not.toBeNull();
    expect(inp).not.toBeNull();

    btn.click();
    expect(count()).toBe(1);
    expect(btn.textContent).toBe("Clicks: 1");

    inp.value = "hello portal";
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    expect(text()).toBe("hello portal");
  });

  it("should support Show inside Portal", () => {
    const isVisible = createValue(false);

    unmount = mount(
      () =>
        Portal(portalTarget, () =>
          Show(
            isVisible,
            () => $("span", { className: "shown", textContent: "Visible" }),
            () => $("span", { className: "fallback", textContent: "Hidden" }),
          ),
        ),
      container,
    );

    expect(container.textContent).toBe("");
    expect(portalTarget.textContent).toBe("Hidden");

    isVisible(true);
    expect(portalTarget.textContent).toBe("Visible");

    isVisible(false);
    expect(portalTarget.textContent).toBe("Hidden");

    unmount();
    unmount = undefined;
    expect(portalTarget.textContent).toBe("");
  });

  it("should support Portal inside Show (and clean up portaled nodes when Show toggles off)", () => {
    const isOpen = createValue(false);
    const unmountedSpy = vi.fn();

    const ModalContent = createComponent(() => {
      onUnmounted(unmountedSpy);
      return $("div", { className: "modal", textContent: "Modal Open" });
    });

    unmount = mount(
      () =>
        $("div", { className: "app" }, [
          Show(isOpen, () => Portal(portalTarget, ModalContent)),
        ]),
      container,
    );

    expect(portalTarget.textContent).toBe("");

    isOpen(true);
    expect(portalTarget.textContent).toBe("Modal Open");
    expect(unmountedSpy).not.toHaveBeenCalled();

    isOpen(false);
    expect(portalTarget.textContent).toBe("");
    expect(portalTarget.querySelector(".modal")).toBeNull();
    expect(unmountedSpy).toHaveBeenCalledTimes(1);

    isOpen(true);
    expect(portalTarget.textContent).toBe("Modal Open");
  });

  it("should support List inside Portal (including dynamic additions, reordering, and unmount)", () => {
    type Item = { id: number; text: string };
    const items = createValue<Item[]>([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);

    const ItemView = (item: Value<Item>) => $("span", { textContent: item.as((i) => i.text) });

    unmount = mount(
      () => Portal(portalTarget, () => List(items, (i) => i.id, ItemView)),
      container,
    );

    expect(container.textContent).toBe("");
    expect(portalTarget.textContent).toBe("AB");

    // Add item C, remove A
    items([
      { id: 2, text: "B" },
      { id: 3, text: "C" },
    ]);
    expect(portalTarget.textContent).toBe("BC");

    // Reorder C then B
    items([
      { id: 3, text: "C" },
      { id: 2, text: "B" },
    ]);
    expect(portalTarget.textContent).toBe("CB");

    // Unmount should remove all items (including dynamically added item C) from portalTarget
    unmount();
    unmount = undefined;
    expect(portalTarget.textContent).toBe("");
    expect(portalTarget.querySelectorAll("span").length).toBe(0);
  });

  it("should support Portal inside List without yanking nodes out of portalTarget on reorder", () => {
    type Item = { id: number; text: string };
    const items = createValue<Item[]>([
      { id: 1, text: "Toast 1" },
      { id: 2, text: "Toast 2" },
    ]);

    unmount = mount(
      () =>
        $("div", { className: "list-host" }, [
          List(
            items,
            (i) => i.id,
            (item) => Portal(portalTarget, () => $("div", { className: "toast", textContent: item.as((i) => i.text) })),
          ),
        ]),
      container,
    );

    expect(container.querySelectorAll(".toast").length).toBe(0);
    expect(portalTarget.querySelectorAll(".toast").length).toBe(2);
    expect(portalTarget.textContent).toBe("Toast 1Toast 2");

    // Reorder list items
    items([
      { id: 2, text: "Toast 2" },
      { id: 1, text: "Toast 1" },
    ]);
    expect(container.querySelectorAll(".toast").length).toBe(0);
    expect(portalTarget.querySelectorAll(".toast").length).toBe(2);

    // Remove item 1
    items([{ id: 2, text: "Toast 2" }]);
    expect(portalTarget.querySelectorAll(".toast").length).toBe(1);
    expect(portalTarget.textContent).toBe("Toast 2");
  });

  it("should support Switch inside Portal", () => {
    const step = createValue<"one" | "two" | "three">("one");

    unmount = mount(
      () =>
        Portal(portalTarget, () =>
          Switch(step, {
            one: () => $("div", { textContent: "Step 1" }),
            two: () => $("div", { textContent: "Step 2" }),
            three: () => $("div", { textContent: "Step 3" }),
          }),
        ),
      container,
    );

    expect(container.textContent).toBe("");
    expect(portalTarget.textContent).toBe("Step 1");

    step("two");
    expect(portalTarget.textContent).toBe("Step 2");

    step("three");
    expect(portalTarget.textContent).toBe("Step 3");

    unmount();
    unmount = undefined;
    expect(portalTarget.textContent).toBe("");
  });

  it("should supportSuspense inside Portal", async () => {
    let resolvePromise!: (val: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    const renderSuspense = ({ state, value, error }: SuspenseState<string>) =>
      Switch(state, {
        pending: () => $("div", { textContent: "Loading in Portal..." }),
        resolved: () => $("div", { textContent: value() || "" }),
        error: () => $("div", { textContent: `Error: ${error()?.message}` }),
      });

    unmount = mount(
      () => Portal(portalTarget, () => Suspense(promise, renderSuspense)),
      container,
    );

    expect(container.textContent).toBe("");
    expect(portalTarget.textContent).toBe("Loading in Portal...");

    resolvePromise("Suspense Resolved in Portal");
    await new Promise((r) => setTimeout(r, 15));

    expect(portalTarget.textContent).toBe("Suspense Resolved in Portal");

    unmount();
    unmount = undefined;
    expect(portalTarget.textContent).toBe("");
  });

  it("should support lazy() inside Portal", async () => {
    let resolvePromise!: (val: { default: any }) => void;
    const promise = new Promise<{ default: any }>((resolve) => {
      resolvePromise = resolve;
    });

    const LazyModal = lazy(() => promise, {
      fallback: () => $("div", { textContent: "Lazy Loading..." }),
    });

    unmount = mount(
      () => Portal(portalTarget, () => LazyModal()),
      container,
    );

    expect(container.textContent).toBe("");
    expect(portalTarget.textContent).toBe("Lazy Loading...");

    resolvePromise({ default: createComponent(() => $("div", { textContent: "Lazy Loaded in Portal" })) });
    await new Promise((r) => setTimeout(r, 15));

    expect(portalTarget.textContent).toBe("Lazy Loaded in Portal");

    unmount();
    unmount = undefined;
    expect(portalTarget.textContent).toBe("");
  });
});

describe("Portal SSR & Hydration", () => {
  it("should renderToString and hydrate cleanly while mounting Portal content into client target", async () => {
    let portalTarget: HTMLElement | undefined;

    const App = createComponent(() => {
      const label = createValue("Hydrated Portal Content", { id: "portal-label" });
      return $("div", { className: "app-root" }, [
        $("h1", { textContent: "Main App" }),
        Portal(portalTarget || getDocument().body, () => $("div", { className: "modal-box", textContent: label })),
      ]);
    }, "App");

    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(App);
    cleanupSSR();

    expect(html).toContain("Main App");
    expect(html).not.toContain("Hydrated Portal Content");

    const cleanupClient = enableClientMode();
    const clientContainer = getDocument().createElement("div");
    portalTarget = getDocument().createElement("div");
    getDocument().body.appendChild(clientContainer);
    getDocument().body.appendChild(portalTarget);
    clientContainer.innerHTML = html;

    const unmount = hydrate(App, clientContainer, hydrationData);

    expect(clientContainer.querySelector("h1")?.textContent).toBe("Main App");
    expect(clientContainer.querySelector(".modal-box")).toBeNull();
    expect(portalTarget.querySelector(".modal-box")?.textContent).toBe("Hydrated Portal Content");

    unmount();
    expect(portalTarget.querySelector(".modal-box")).toBeNull();

    clientContainer.remove();
    portalTarget.remove();
    cleanupClient();
  });
});

