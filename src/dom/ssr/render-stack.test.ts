import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { clearHydrationContext } from "./hydration-context.js";
import { getActiveSSRScope, isInSSRMode, popSSRScope, pushSSRScope } from "./render-stack.js";
import { SSRScope } from "./ssr-scope.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Render Stack", () => {
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

  describe("Scope Stack", () => {
    it("should push and pop scopes", () => {
      const scope1 = new SSRScope();
      const scope2 = new SSRScope();

      expect(isInSSRMode()).toBe(false);
      expect(getActiveSSRScope()).toBeUndefined();

      pushSSRScope(scope1);

      expect(isInSSRMode()).toBe(true);
      expect(getActiveSSRScope()).toBe(scope1);

      pushSSRScope(scope2);

      expect(getActiveSSRScope()).toBe(scope2);

      popSSRScope();

      expect(getActiveSSRScope()).toBe(scope1);

      popSSRScope();

      expect(isInSSRMode()).toBe(false);
      expect(getActiveSSRScope()).toBeUndefined();
    });

    it("should handle nested scopes", () => {
      const outer = new SSRScope();
      const middle = new SSRScope();
      const inner = new SSRScope();

      pushSSRScope(outer);
      expect(getActiveSSRScope()).toBe(outer);

      pushSSRScope(middle);
      expect(getActiveSSRScope()).toBe(middle);

      pushSSRScope(inner);
      expect(getActiveSSRScope()).toBe(inner);

      popSSRScope();
      expect(getActiveSSRScope()).toBe(middle);

      popSSRScope();
      expect(getActiveSSRScope()).toBe(outer);

      popSSRScope();
      expect(getActiveSSRScope()).toBeUndefined();
    });
  });

  describe("Concurrent Rendering", () => {
    it("should isolate state between concurrent renders", () => {
      const scope1 = new SSRScope();
      const scope2 = new SSRScope();

      // Render 1
      pushSSRScope(scope1);
      const obs1 = new Seidr(10);
      const state1 = scope1.captureState();
      popSSRScope();

      // Render 2
      pushSSRScope(scope2);
      const obs2 = new Seidr(20);
      const state2 = scope2.captureState();
      popSSRScope();

      // States should be isolated
      expect(state1.observables[obs1.id]).toBe(10);
      expect(state2.observables[obs2.id]).toBe(20);
      expect(state1.observables[obs2.id]).toBeUndefined();
      expect(state2.observables[obs1.id]).toBeUndefined();
    });

    it("should handle nested component rendering", () => {
      const outer = new SSRScope();
      const inner = new SSRScope();

      pushSSRScope(outer);
      const outerObs = new Seidr("outer");

      pushSSRScope(inner);
      const innerObs = new Seidr("inner");

      expect(getActiveSSRScope()).toBe(inner);
      expect(outer.has(outerObs.id)).toBe(true);
      expect(inner.has(innerObs.id)).toBe(true);

      popSSRScope();
      expect(getActiveSSRScope()).toBe(outer);

      popSSRScope();
      expect(getActiveSSRScope()).toBeUndefined();
    });
  });
});
