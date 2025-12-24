import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { component } from "../component.js";
import { $ } from "../element.js";
import { hydrate } from "./hydrate.js";
import { clearHydrationContext, getHydrationContext, isHydrating, setHydrationContext } from "./hydration-context.js";
import { renderToString } from "./render-to-string.js";
import { setActiveSSRScope, SSRScope } from "./ssr-scope.js";
import type { HydrationData } from "./types.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Utilities", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    // @ts-expect-error
    process.env.SEIDR_TEST_SSR = true;
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear active scope
    setActiveSSRScope(undefined);

    // Clear hydration context
    clearHydrationContext();
  });

  describe("hydrate", () => {
    it("should restore observable values during hydration", () => {
      // Server-side capture
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const count = new Seidr(42); // Create AFTER pushing scope so it gets registered

      const TestComponent = () =>
        component(() => {
          return $("div", { textContent: count.as((n) => `Count: ${n}`) });
        });

      const { hydrationData } = renderToString(TestComponent, scope);
      setActiveSSRScope(undefined);

      // Client-side hydration (same signature as renderToString!)
      const hydratedElement = hydrate(TestComponent, hydrationData);

      expect(hydratedElement).toBeDefined();
      // The hydrated element should have the server-side value
      expect(String(hydratedElement)).toContain("Count: 42");
    });

    it("should clear hydration context after hydration", () => {
      const hydrationData: HydrationData = {
        observables: {},
        bindings: {},
        graph: { nodes: [], rootIds: [] },
      };

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        });

      expect(isHydrating()).toBe(false);

      hydrate(TestComponent, hydrationData);

      expect(isHydrating()).toBe(false);
    });

    it("should restore nested context after hydration", () => {
      const originalData: HydrationData = {
        observables: { 0: 1 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      const hydrateData: HydrationData = {
        observables: { 0: 2 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationContext(originalData);

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        });

      hydrate(TestComponent, hydrateData);

      // Should restore original context
      const context = getHydrationContext();
      expect(context).not.toBeNull();
      expect(context!.observables[0]).toBe(1);
    });
  });
});
