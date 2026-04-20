import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state";
import { createAppState } from "../app-state/create-app-state";
import { DATA_KEY_STATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { enableSSRMode, resetNextId } from "../test-setup";
import { clearHydrationData } from "./hydrate/storage";
import { SSRScope, setSSRScope } from "./ssr-scope";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSRScope", () => {
  let scope: SSRScope;

  beforeEach(() => {
    // Enable SSR mode for all tests
    enableSSRMode();
    resetNextId();
    process.env.SEIDR_TEST_SSR = "true";

    scope = new SSRScope(getAppState());
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear active scope
    setSSRScope(undefined);

    // Clear hydration context
    clearHydrationData();
  });

  it("should register observables", () => {
    const observable = new Seidr(42);

    expect(scope.size).toBe(1);
    expect(scope.get(observable.id)).toBe(observable);
  });

  it("should register multiple observables", () => {
    const obs1 = new Seidr(1);
    const obs2 = new Seidr("test");
    const obs3 = new Seidr(true);

    expect(scope.size).toBe(3);
    expect(scope.get(obs1.id)).toBe(obs1);
    expect(scope.get(obs2.id)).toBe(obs2);
    expect(scope.get(obs3.id)).toBe(obs3);
  });

  it("should capture state with only root observables", () => {
    const root1 = new Seidr(10, { id: "root1" });
    const root2 = new Seidr("hello", { id: "root2" });
    const _derived = root1.as((x) => x * 2);

    const hydrationData = scope.captureHydrationData();

    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);
    expect(hydrationData.data[DATA_KEY_STATE]!.root1).toBe(root1.value);
    expect(hydrationData.data[DATA_KEY_STATE]!.root2).toBe(root2.value);
  });

  it("should capture complex types", () => {
    const objObs = new Seidr({ foo: "bar", nested: { value: 42 } }, { id: "obj" });
    const arrayObs = new Seidr([1, 2, 3], { id: "arr" });

    const hydrationData = scope.captureHydrationData();

    expect(hydrationData.data[DATA_KEY_STATE]!.obj).toEqual(objObs.value);
    expect(hydrationData.data[DATA_KEY_STATE]!.arr).toEqual(arrayObs.value);
  });

  it("should clear all observables", () => {
    const obs1 = new Seidr(1);
    const obs2 = new Seidr(2);

    expect(scope.size).toBe(2);

    scope.clear();

    expect(scope.size).toBe(0);
    expect(scope.get(obs1.id)).toBeFalsy();
    expect(scope.get(obs2.id)).toBeFalsy();
  });

  it("should handle registering same observable twice", () => {
    const _obs1 = new Seidr(42, { id: "a" });
    const _obs2 = new Seidr(0, { id: "a" });

    expect(scope.size).toBe(1);
  });

  describe("Auto-registration", () => {
    it("should auto-register Seidr instances when first observed/bound in scope", () => {
      const scope = new SSRScope(getAppState());
      setSSRScope(scope);

      const obs1 = new Seidr(42);
      const obs2 = new Seidr("test");

      // Registered immediately in constructor
      expect(scope.size).toBe(2);
      expect(scope.get(obs1.id)).toBe(obs1);
      expect(scope.get(obs2.id)).toBe(obs2);

      setSSRScope(undefined);
    });

    it("should not auto-register when no active scope", () => {
      const isolatedState = createAppState(999);
      const scope = new SSRScope(isolatedState);

      // Create observable in the global state, not the isolated one
      const obs = new Seidr(42);
      obs.observe(() => {});

      expect(scope.size).toBe(0);
    });
  });
});
