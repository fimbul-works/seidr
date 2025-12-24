import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { $ } from "../element.js";
import { hydrate } from "./hydrate.js";
import { clearHydrationContext, getHydrationContext, isHydrating, setHydrationContext } from "./hydration-context.js";
import { isInSSRMode, popSSRScope, pushSSRScope } from "./render-stack.js";
import { renderToString } from "./render-to-string.js";
import { SSRScope } from "./ssr-scope.js";
import type { SSRState } from "./types.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Utilities", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    process.env.SEIDR_TEST_SSR = "true";
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear any remaining scopes
    while (isInSSRMode()) {
      popSSRScope();
    }

    // Clear hydration context
    clearHydrationContext();
  });

  describe("hydrate", () => {
    it("should restore observable values during hydration", () => {
      // Server-side capture
      const count = new Seidr(42);
      const scope = new SSRScope();
      pushSSRScope(scope);

      const component = () => {
        // @ts-expect-error
        return $("div", {}, [`Count: ${count.value}`]);
      };

      const { state } = renderToString(component, scope);
      popSSRScope();

      // Client-side hydration
      const hydratedElement = hydrate(component, state);

      expect(hydratedElement).toBeDefined();
      // The hydrated element should have the server-side value
      expect(String(hydratedElement)).toContain("Count: 42");
    });

    it("should clear hydration context after hydration", () => {
      const state: SSRState = { observables: {} };

      const component = () => {
        // @ts-expect-error
        return $("div", {}, ["test"]);
      };

      expect(isHydrating()).toBe(false);

      hydrate(component, state);

      expect(isHydrating()).toBe(false);
    });

    it("should restore nested context after hydration", () => {
      const originalState: SSRState = {
        observables: { original: 1 },
      };

      const hydrateState: SSRState = {
        observables: { hydrate: 2 },
      };

      setHydrationContext({ state: originalState });

      // @ts-expect-error
      const component = () => $("div", {}, ["test"]);

      hydrate(component, hydrateState);

      // Should restore original context
      expect(getHydrationContext().state).toBe(originalState);
    });
  });
});
