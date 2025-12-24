import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { clearHydrationContext } from "./hydration-context.js";
import { isInSSRMode, popSSRScope, pushSSRScope } from "./render-stack.js";
import { SSRScope } from "./ssr-scope.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSRScope", () => {
  let scope: SSRScope;

  beforeEach(() => {
    // Enable SSR mode for all tests
    process.env.SEIDR_TEST_SSR = "true";
    scope = new SSRScope();
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

  it("should register observables", () => {
    const observable = new Seidr(42);

    scope.register(observable);

    expect(scope.size).toBe(1);
    expect(scope.has(observable.id)).toBe(true);
    expect(scope.get(observable.id)).toBe(observable);
  });

  it("should register multiple observables", () => {
    const obs1 = new Seidr(1);
    const obs2 = new Seidr("test");
    const obs3 = new Seidr(true);

    scope.register(obs1);
    scope.register(obs2);
    scope.register(obs3);

    expect(scope.size).toBe(3);
    expect(scope.has(obs1.id)).toBe(true);
    expect(scope.has(obs2.id)).toBe(true);
    expect(scope.has(obs3.id)).toBe(true);
  });

  it("should capture state with only root observables", () => {
    const root1 = new Seidr(10);
    const root2 = new Seidr("hello");
    const derived = root1.as((x) => x * 2);

    scope.register(root1);
    scope.register(root2);
    scope.register(derived);

    const state = scope.captureState();

    // Should only contain root observables
    expect(Object.keys(state.observables)).toHaveLength(2);
    expect(state.observables[root1.id]).toBe(10);
    expect(state.observables[root2.id]).toBe("hello");
    // derived should not be in state
    expect(state.observables[derived.id]).toBeUndefined();
  });

  it("should capture complex types", () => {
    const objObs = new Seidr({ foo: "bar", nested: { value: 42 } });
    const arrayObs = new Seidr([1, 2, 3]);

    scope.register(objObs);
    scope.register(arrayObs);

    const state = scope.captureState();

    expect(state.observables[objObs.id]).toEqual({ foo: "bar", nested: { value: 42 } });
    expect(state.observables[arrayObs.id]).toEqual([1, 2, 3]);
  });

  it("should clear all observables", () => {
    const obs1 = new Seidr(1);
    const obs2 = new Seidr(2);

    scope.register(obs1);
    scope.register(obs2);

    expect(scope.size).toBe(2);

    scope.clear();

    expect(scope.size).toBe(0);
    expect(scope.has(obs1.id)).toBe(false);
    expect(scope.has(obs2.id)).toBe(false);
  });

  it("should handle registering same observable twice", () => {
    const observable = new Seidr(42);

    scope.register(observable);
    scope.register(observable);

    expect(scope.size).toBe(1);
  });

  describe("Auto-registration", () => {
    it("should auto-register Seidr instances created in scope", () => {
      const scope = new SSRScope();
      pushSSRScope(scope);

      const obs1 = new Seidr(42);
      const obs2 = new Seidr("test");

      expect(scope.size).toBe(2);
      expect(scope.has(obs1.id)).toBe(true);
      expect(scope.has(obs2.id)).toBe(true);

      popSSRScope();
    });

    it("should not auto-register when no active scope", () => {
      const scope = new SSRScope();

      // Don't push scope
      const obs = new Seidr(42);

      expect(scope.size).toBe(0);
    });

    it("should auto-register derived observables", () => {
      const scope = new SSRScope();
      pushSSRScope(scope);

      const root = new Seidr(10);
      const derived = root.as((x) => x * 2);

      expect(scope.size).toBe(2);
      expect(scope.has(root.id)).toBe(true);
      expect(scope.has(derived.id)).toBe(true);

      popSSRScope();
    });

    it("should auto-register computed observables", () => {
      const scope = new SSRScope();
      pushSSRScope(scope);

      const a = new Seidr(2);
      const b = new Seidr(3);
      const computed = Seidr.computed(() => a.value + b.value, [a, b]);

      expect(scope.size).toBe(3);
      expect(scope.has(a.id)).toBe(true);
      expect(scope.has(b.id)).toBe(true);
      expect(scope.has(computed.id)).toBe(true);

      popSSRScope();
    });
  });
});
