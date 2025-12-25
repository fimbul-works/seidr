import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../seidr.js";
import { enableClientMode } from "../test-setup.js";
import { component } from "./component.js";
import { $ } from "./element.js";
import { hydrate } from "./hydrate.js";
import {
  clearHydrationContext,
  getHydrationContext,
  isHydrating,
  setHydrationContext,
} from "./ssr/hydration-context.js";
import { renderToString } from "./ssr/render-to-string.js";
import { SSRScope, setActiveSSRScope } from "./ssr/ssr-scope.js";
import type { HydrationData } from "./ssr/types.js";

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
    it("should restore observable values during hydration", async () => {
      const TestComponent = () =>
        component(() => {
          // CRITICAL: State MUST be created inside the component for SSR!
          const count = new Seidr(42);
          return $("div", { textContent: count.as((n) => `Count: ${n}`) });
        });

      // Server-side capture
      const scope = new SSRScope();
      setActiveSSRScope(scope);

      const { hydrationData } = await renderToString(TestComponent, scope);
      setActiveSSRScope(undefined);

      // Switch to client mode for hydration
      const cleanupClientMode = enableClientMode();

      // Client-side hydration
      const container = document.createElement("div");
      const hydratedComponent = hydrate(TestComponent, container, hydrationData);

      expect(hydratedComponent).toBeDefined();
      // The hydrated element should have the server-side value
      expect(String(container.textContent)).toContain("Count: 42");

      // Cleanup client mode
      cleanupClientMode();
    });

    it("should clear hydration context after hydration", () => {
      const hydrationData: HydrationData = {
        renderContextID: 0,
        observables: {},
        bindings: {},
        graph: { nodes: [], rootIds: [] },
      };

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        });

      expect(isHydrating()).toBe(false);

      // Switch to client mode for hydration
      const cleanupClientMode = enableClientMode();

      const container = document.createElement("div");
      hydrate(TestComponent, container, hydrationData);

      expect(isHydrating()).toBe(false);

      // Cleanup client mode
      cleanupClientMode();
    });

    it("should restore nested context after hydration", () => {
      const originalData: HydrationData = {
        renderContextID: 0,
        observables: { 0: 1 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      const hydrateData: HydrationData = {
        renderContextID: 1,
        observables: { 0: 2 },
        bindings: {},
        graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
      };

      setHydrationContext(originalData);

      const TestComponent = () =>
        component(() => {
          return $("div", {}, ["test"]);
        });

      // Switch to client mode for hydration
      const cleanupClientMode = enableClientMode();

      const container = document.createElement("div");
      hydrate(TestComponent, container, hydrateData);

      // Should restore original context
      const context = getHydrationContext();
      expect(context).not.toBeNull();
      // @ts-expect-error
      expect(context.observables[0]).toBe(1);

      // Cleanup client mode
      cleanupClientMode();
    });
  });
});
