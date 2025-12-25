import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { component } from "../component.js";
import { $ } from "../element.js";
import { enableSSRMode, enableClientMode } from "../../test-setup.js";
import { clearHydrationContext } from "./hydration-context.js";
import { renderToString } from "./render-to-string.js";
import { setActiveSSRScope, SSRScope } from "./ssr-scope.js";
import { hydrate } from "../hydrate.js";

describe("SSR Reactive Bindings Integration", () => {
  let cleanupMode: () => void;

  describe("Server-Side Rendering with Reactive Props", () => {
    beforeEach(() => {
      cleanupMode = enableSSRMode();
    });

    afterEach(() => {
      cleanupMode();
      setActiveSSRScope(undefined);
      clearHydrationContext();
    });

    it("should register bindings for reactive props during SSR", () => {
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const isActive = new Seidr(false);
      const button = $("button", { disabled: isActive });

      const hydrationData = scope.captureHydrationData();
      setActiveSSRScope(undefined);

      // Should have one binding registered
      expect(Object.keys(hydrationData.bindings)).toHaveLength(1);

      // Get the element ID (first and only binding)
      const elementId = Object.keys(hydrationData.bindings)[0];
      expect(elementId).toBeDefined();

      // Check the binding
      const bindings = hydrationData.bindings[elementId];
      expect(bindings).toHaveLength(1);
      expect(bindings[0].prop).toBe("disabled");
    });

    it("should render reactive button with correct initial value", () => {
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const isActive = new Seidr(true); // true to get disabled attribute
      const button = $("button", { disabled: isActive, textContent: "Click me" });

      const html = button.toString();
      setActiveSSRScope(undefined);

      // Should render with initial value
      expect(html).toContain("disabled");
      expect(html).toContain("Click me");
    });

    it("should capture multiple bindings on same element", () => {
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const count = new Seidr(5);
      const isActive = new Seidr(true);
      const button = $("button", {
        disabled: isActive,
        textContent: count.as((n) => `Count: ${n}`),
      });

      const hydrationData = scope.captureHydrationData();
      setActiveSSRScope(undefined);

      // Should have one element with 2 bindings
      expect(Object.keys(hydrationData.bindings)).toHaveLength(1);

      const elementId = Object.keys(hydrationData.bindings)[0];
      const bindings = hydrationData.bindings[elementId];
      expect(bindings).toHaveLength(2);

      // Check both bindings
      const disabledBinding = bindings.find((b) => b.prop === "disabled");
      const textBinding = bindings.find((b) => b.prop === "textContent");

      expect(disabledBinding).toBeDefined();
      expect(textBinding).toBeDefined();
    });

    it("should work with renderToString and hydrate", async () => {
      const App = () =>
        component(() => {
          const count = new Seidr(42);
          return $("button", {
            disabled: count.as((n) => n > 100),
            textContent: count.as((n) => `Count: ${n}`),
          });
        });

      // Server-side
      const { html, hydrationData } = await renderToString(App);

      expect(html).toContain("Count: 42");
      expect(html).not.toContain("disabled"); // 42 is not > 100

      // Check bindings were captured
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);

      // Client-side
      cleanupMode = enableClientMode();
      const container = document.createElement('div');
      const hydratedComponent = hydrate(App, container, hydrationData);

      expect(hydratedComponent).toBeDefined();
      expect(String(container.textContent)).toContain("Count: 42");
    });
  });

  describe("Client-Side Hydration with Bindings", () => {
    beforeEach(() => {
      cleanupMode = enableClientMode();
    });

    afterEach(() => {
      cleanupMode();
      clearHydrationContext();
    });

    it("should apply bindings during hydration", async () => {
      // First, create SSR data
      let hydrationData: any;

      {
        const ssrMode = enableSSRMode();
        const scope = new SSRScope();
        setActiveSSRScope(scope);

        // Create count and App in SSR scope
        const count = new Seidr(42);
        const App = () =>
          component(() => {
            return $("button", {
              disabled: count.as((n) => n > 100),
              textContent: count.as((n) => `Count: ${n}`),
            });
          });

        const { hydrationData: data } = await renderToString(App, scope);
        hydrationData = data;
        setActiveSSRScope(undefined);
        ssrMode();
      }

      // Now hydrate on client - create count inside component so it gets hydrated
      const App = () =>
        component(() => {
          const count = new Seidr(0); // Will be overridden by hydration
          return $("button", {
            disabled: count.as((n) => n > 100),
            textContent: count.as((n) => `Count: ${n}`),
          });
        });

      const container = document.createElement('div');
      const hydratedComp = hydrate(App, container, hydrationData);

      // Should have server values
      expect(String(container.textContent)).toContain("Count: 42");
    });
  });
});
