import { describe, expect, it, vi } from "vitest";
import { component } from "../component/component";
import { $ } from "../element";
import { renderToString } from "./render-to-string";
import { hydrate } from "./hydrate";
import { enableClientMode } from "../test-setup";

describe("Partial Hydration", () => {
  it("should recover from a mismatch by replacing only the affected subtree", async () => {
    const Child = component(({ name, mismatched }: { name: string; mismatched?: boolean }) => {
      // If mismatched is true, we render a different tag on client
      const tag = mismatched ? "section" : "div";
      return $(tag as any, { id: `child-${name}` }, [`Child ${name}`]);
    }, "Child");

    const App = component(() => {
      return $("div", { id: "app" }, [
        Child({ name: "1" }),
        Child({ name: "2", mismatched: true }), // This will mismatch during client hydration
        Child({ name: "3" }),
      ]);
    }, "App");

    // 1. Server-side render (all divs)
    const { html, hydrationData } = await renderToString(() => {
      return $("div", { id: "app" }, [
        Child({ name: "1" }),
        Child({ name: "2", mismatched: false }), // Server renders a div
        Child({ name: "3" }),
      ]);
    });

    expect(html).toContain('id="child-2"');
    expect(html).not.toContain("section");

    // 2. Client-side hydration with a mismatching component
    enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;

    // We expect a warning for Component-2
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    console.log("SERVER HTML:", html);
    hydrate(App, container, hydrationData);
    console.log("CLIENT HTML:", container.innerHTML);

    // 3. Verify results
    const child1 = container.querySelector("#child-1");
    const child2 = container.querySelector("#child-2");
    const child3 = container.querySelector("#child-3");

    if (!child1) console.log("Child 1 not found!");
    if (!child2) console.log("Child 2 not found!");
    if (!child3) console.log("Child 3 not found!");

    expect(child1?.tagName).toBe("DIV");
    expect(child2?.tagName).toBe("SECTION"); // Recovered with client-side SECTION
    expect(child3?.tagName).toBe("DIV");

    // Verify warn was called for the mismatch
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Hydration mismatch"));
  });
});
