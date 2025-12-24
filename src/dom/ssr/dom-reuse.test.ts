import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { enableClientMode, enableSSRMode } from "../../test-setup.js";
import { component } from "../component.js";
import { $ } from "../element.js";
import { hydrate } from "./hydrate.js";
import { clearHydrationContext } from "./hydration-context.js";
import { renderToString } from "./render-to-string.js";
import { SSRScope, setActiveSSRScope } from "./ssr-scope.js";

describe("DOM Element Reuse During Hydration", () => {
  let cleanupMode: () => void;

  afterEach(() => {
    // Clean up document body
    if (document.body) {
      document.body.innerHTML = "";
    }
    clearHydrationContext();
    // Clear consumed elements tracking
    delete (window as any).__seidr_consumed_elements;
  });

  describe("Full SSR to Hydration Flow", () => {
    it("should reuse existing DOM elements during hydration", () => {
      // Step 1: Server-side rendering
      cleanupMode = enableSSRMode();
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const App = () =>
        component(() => {
          const count = new Seidr(42);
          return $("button", {
            className: "counter",
            disabled: count.as((n) => n > 100),
            textContent: count.as((n) => `Count: ${n}`),
          });
        });

      const { html, hydrationData } = renderToString(App, scope);
      setActiveSSRScope(undefined);
      cleanupMode();

      // Step 2: Set up the DOM with SSR output
      document.body.innerHTML = html;

      // Verify SSR HTML is in the DOM
      const ssrButton = document.querySelector("button.counter");
      expect(ssrButton).toBeDefined();
      expect(ssrButton?.textContent).toBe("Count: 42");

      // Step 3: Switch to client mode and hydrate
      cleanupMode = enableClientMode();

      // This should reuse the existing button element, not create a new one
      const hydratedButton = hydrate(App, hydrationData) as HTMLButtonElement;

      // Verify the hydrated button is the SAME element as the SSR button
      expect(hydratedButton).toBe(ssrButton);

      // Verify it has the correct content and state
      expect(hydratedButton.textContent).toBe("Count: 42");
      expect(hydratedButton.disabled).toBe(false); // 42 is not > 100

      // Verify it's still in the DOM
      expect(document.body.contains(hydratedButton)).toBe(true);
    });

    it("should reuse nested elements during hydration", () => {
      // Step 1: Server-side rendering
      cleanupMode = enableSSRMode();
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const App = () =>
        component(() => {
          const title = new Seidr("Hello SSR");
          const subtitle = new Seidr("Hydration Test");
          return $("div", { className: "container" }, [
            $("h1", { textContent: title }),
            $("p", { textContent: subtitle }),
          ]);
        });

      const { html, hydrationData } = renderToString(App, scope);
      setActiveSSRScope(undefined);
      cleanupMode();

      // Step 2: Set up the DOM with SSR output
      document.body.innerHTML = html;

      const ssrH1 = document.querySelector("h1");
      const ssrP = document.querySelector("p");

      expect(ssrH1).toBeDefined();
      expect(ssrP).toBeDefined();

      // Step 3: Switch to client mode and hydrate
      cleanupMode = enableClientMode();

      const hydratedContainer = hydrate(App, hydrationData) as HTMLDivElement;

      // Verify children (with reactive bindings) are the same elements
      const hydratedH1 = hydratedContainer.querySelector("h1");
      const hydratedP = hydratedContainer.querySelector("p");

      expect(hydratedH1).toBe(ssrH1);
      expect(hydratedP).toBe(ssrP);

      // Verify content
      expect(hydratedH1?.textContent).toBe("Hello SSR");
      expect(hydratedP?.textContent).toBe("Hydration Test");
    });

    it("should handle complex component trees with element reuse", () => {
      // Step 1: Server-side rendering
      cleanupMode = enableSSRMode();
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const TodoApp = () =>
        component(() => {
          const title = new Seidr("TODO App");
          const todoCount = new Seidr(2);

          return $("div", { className: "todo-app" }, [
            $("h2", { textContent: title }),
            $("p", { textContent: todoCount.as((n) => `${n} items`) }),
          ]);
        });

      const { html, hydrationData } = renderToString(TodoApp, scope);
      cleanupMode();

      // Step 2: Set up the DOM with SSR output
      document.body.innerHTML = html;

      const ssrH2 = document.querySelector(".todo-app h2");
      const ssrP = document.querySelector(".todo-app p");

      expect(ssrH2?.textContent).toBe("TODO App");

      // Step 3: Switch to client mode and hydrate
      cleanupMode = enableClientMode();

      const hydratedApp = hydrate(TodoApp, hydrationData) as HTMLDivElement;

      // Verify children (with reactive bindings) are the same elements
      const hydratedH2 = hydratedApp.querySelector("h2");
      const hydratedP = hydratedApp.querySelector("p");

      expect(hydratedH2).toBe(ssrH2);
      expect(hydratedP).toBe(ssrP);

      // Verify content
      expect(hydratedH2?.textContent).toBe("TODO App");
      expect(hydratedP?.textContent).toBe("2 items");
    });

    it("should maintain event listeners when reusing elements", () => {
      // Step 1: Server-side rendering
      cleanupMode = enableSSRMode();
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const App = () =>
        component(() => {
          const count = new Seidr(0);
          return $("button", {
            textContent: count.as((n) => `Clicks: ${n}`),
          });
        });

      const { html, hydrationData } = renderToString(App, scope);
      setActiveSSRScope(undefined);
      cleanupMode();

      // Step 2: Set up the DOM with SSR output
      document.body.innerHTML = html;

      const ssrButton = document.querySelector("button") as HTMLButtonElement;
      expect(ssrButton).toBeDefined();

      // Add an event listener to the SSR button (simulating what might happen)
      let clickCount = 0;
      ssrButton.addEventListener("click", () => {
        clickCount++;
      });

      // Step 3: Switch to client mode and hydrate
      cleanupMode = enableClientMode();

      const hydratedButton = hydrate(App, hydrationData) as HTMLButtonElement;

      // Verify it's the same element
      expect(hydratedButton).toBe(ssrButton);

      // Trigger a click - the event listener should still work
      hydratedButton.click();
      expect(clickCount).toBe(1);
    });
  });

  describe("Element Reuse Edge Cases", () => {
    it("should create new element if data-seidr-id not found in DOM", () => {
      // Skip SSR, just hydrate without existing DOM
      cleanupMode = enableClientMode();

      const App = () =>
        component(() => {
          const text = new Seidr("Test");
          return $("div", { textContent: text });
        });

      const hydrationData = {
        observables: { 0: "Test" },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      const element = hydrate(App, hydrationData) as HTMLDivElement;

      expect(element).toBeDefined();
      expect(element.textContent).toBe("Test");
      expect(document.body.contains(element)).toBe(false); // Not mounted
    });

    it("should handle partial DOM reuse (some elements exist, some don't)", () => {
      // Step 1: Server-side rendering
      cleanupMode = enableSSRMode();
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const App = () =>
        component(() => {
          return $("div", { className: "root" }, [
            $("span", { textContent: "Existing", "data-seidr-id": "existing-id" }),
            $("span", { textContent: "New" }),
          ]);
        });

      const { html, hydrationData } = renderToString(App, scope);
      setActiveSSRScope(undefined);
      cleanupMode();

      // Step 2: Manually create DOM with only one element
      document.body.innerHTML = `<div class="root"><span data-seidr-id="existing-id">Existing</span></div>`;

      // Step 3: Hydrate
      cleanupMode = enableClientMode();

      const hydratedRoot = hydrate(App, hydrationData) as HTMLDivElement;

      expect(hydratedRoot).toBeDefined();
      expect(hydratedRoot.children.length).toBe(2);
    });
  });
});
