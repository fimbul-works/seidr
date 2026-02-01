import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element";
import { runWithRenderContext } from "../render-context/render-context.node";
import { Seidr } from "../seidr";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { hydrate } from "./hydrate";
import { clearHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";
import { SSRScope, setActiveSSRScope } from "./ssr-scope";
import "../dom-factory/dom-factory.node";

describe("SSR Reactive Bindings Integration", () => {
  let cleanupMode: CleanupFunction;

  describe("Server-Side Rendering with Reactive Props", () => {
    beforeEach(() => {
      cleanupMode = enableSSRMode();
    });

    afterEach(() => {
      cleanupMode();
      setActiveSSRScope(undefined);
      clearHydrationData();
    });

    it("should register observables for reactive props during SSR", async () => {
      await runWithRenderContext(async () => {
        const scope = new SSRScope();
        setActiveSSRScope(scope);

        const isActive = new Seidr(false);
        $("button", { disabled: isActive });

        const hydrationData = scope.captureHydrationData();
        setActiveSSRScope(undefined);

        // Should have captured the observable
        expect(Object.keys(hydrationData.observables)).toHaveLength(1);
        expect(hydrationData.observables[0]).toBe(false);
      });
    });

    it("should render reactive button with correct initial value", async () => {
      await runWithRenderContext(async () => {
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

    it("should capture all observables used in bindings", async () => {
      await runWithRenderContext(async () => {
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

        // Should captured all root observables
        expect(Object.keys(hydrationData.observables)).toHaveLength(2);
        expect(hydrationData.observables[0]).toBe(5);
        expect(hydrationData.observables[1]).toBe(true);
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

      // Check observables were captured
      expect(Object.keys(hydrationData.observables).length).toBeGreaterThan(0);

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
