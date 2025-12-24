import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearHydrationContext,
  getHydratedValue,
  getHydrationContext,
  isHydrating,
  setHydrationContext,
} from "./hydration-context.js";
import { isInSSRMode, popSSRScope } from "./render-stack.js";
import type { SSRState } from "./types.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("Hydration Context", () => {
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

    // Clear any remaining scopes
    while (isInSSRMode()) {
      popSSRScope();
    }

    // Clear hydration context
    clearHydrationContext();
  });

  it("should set and get hydration context", () => {
    const state: SSRState = {
      observables: { "test-id": 42 },
    };

    setHydrationContext({ state });
    const context = getHydrationContext();

    expect(context.state).toBe(state);
    expect(context.state?.observables["test-id"]).toBe(42);
  });

  it("should detect hydration mode", () => {
    expect(isHydrating()).toBe(false);

    setHydrationContext({ state: { observables: {} } });

    expect(isHydrating()).toBe(true);

    clearHydrationContext();

    expect(isHydrating()).toBe(false);
  });

  it("should get hydrated value by ID", () => {
    const state: SSRState = {
      observables: { obs1: 100, obs2: "hello" },
    };

    setHydrationContext({ state });

    expect(getHydratedValue("obs1")).toBe(100);
    expect(getHydratedValue("obs2")).toBe("hello");
    expect(getHydratedValue("nonexistent")).toBeUndefined();
  });

  it("should clear hydration context", () => {
    setHydrationContext({ state: { observables: { x: 1 } } });

    expect(isHydrating()).toBe(true);

    clearHydrationContext();

    expect(isHydrating()).toBe(false);
    expect(getHydrationContext().state).toBeUndefined();
  });
});
