import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../core/dom/component";
import { $ } from "../core/dom/element";
import { Seidr } from "../core/seidr";
import { runWithRenderContext } from "../render-context.node";
import { enableClientMode, enableSSRMode } from "../test-setup";
import { hydrate } from "./hydrate";
import { clearHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";
import { SSRScope, setActiveSSRScope } from "./ssr-scope";

describe("SSR Reactive Bindings Integration", () => {
  let cleanupMode: () => void;

  describe("Server-Side Rendering with Reactive Props", () => {
    beforeEach(() => {
      cleanupMode = enableSSRMode();
    });

    afterEach(() => {
      cleanupMode();
      setActiveSSRScope(undefined);
      clearHydrationData();
    });

    it("should register bindings for reactive props during SSR", () => {
      runWithRenderContext(async () => {
        const scope = new SSRScope();
        setActiveSSRScope(scope);

        const isActive = new Seidr(false);
        $("button", { disabled: isActive });

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
    });

    it("should render reactive button with correct initial value", () => {
      runWithRenderContext(async () => {
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
    });

    it("should capture multiple bindings on same element", () => {
      runWithRenderContext(async () => {
        const scope = new SSRScope();
        setActiveSSRScope(scope);

        const count = new Seidr(5);
        const isActive = new Seidr(true);
        $("button", {
          disabled: isActive,
          textContent: count.as((n) => `Count: ${n}`),
        });

        const hydrationData = scope.captureHydrationData();
        setActiveSSRScope(undefined);

        // Should have one element with 2 bindings
        expect(Object.keys(hydrationData.bindings)).toHaveLength(1);

        const elementId = Object.keys(hydrationData.bindings)[0];
        expect(elementId).toBeDefined();

        // Check the bindings
        const bindings = hydrationData.bindings[elementId];
        expect(bindings).toHaveLength(2);
      });
    });

    it("should work with renderToString and hydrate", async () => {
      const App = () => {
        const count = new Seidr(42);
        return $("button", {
          disabled: count.as((n) => n > 100),
          textContent: count.as((n) => `Count: ${n}`),
        });
      };

      // Server-side
      const { html, hydrationData } = await renderToString(App);

      expect(html).toContain("Count: 42");
      expect(html).not.toContain("disabled"); // 42 is not > 100

      // Check bindings were captured
      expect(Object.keys(hydrationData.bindings).length).toBeGreaterThan(0);

      // Client-side
      cleanupMode = enableClientMode();
      const container = document.createElement("div");
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
      clearHydrationData();
    });

    it("should apply bindings during hydration", async () => {
      // First, create SSR data
      let hydrationData: any;

      {
        const ssrMode = enableSSRMode();

        // Create App with Seidr created INSIDE component (correct pattern)
        const App = () => {
          const count = new Seidr(42);
          return $("button", {
            disabled: count.as((n) => n > 100),
            textContent: count.as((n) => `Count: ${n}`),
          });
        };

        const { hydrationData: data } = await renderToString(App);
        hydrationData = data;
        ssrMode();
      }

      // Now hydrate on client - create count inside component so it gets hydrated
      const App = () => {
        const count = new Seidr(0); // Will be overridden by hydration
        return $("button", {
          disabled: count.as((n) => n > 100),
          textContent: count.as((n) => `Count: ${n}`),
        });
      };

      const container = document.createElement("div");
      hydrate(App, container, hydrationData);

      // Should have server values
      expect(String(container.textContent)).toContain("Count: 42");
    });
  });
});
