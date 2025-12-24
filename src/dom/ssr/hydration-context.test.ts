import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { enableSSRMode } from "../../test-setup.js";
import {
  clearHydrationContext,
  getHydratedValue,
  getHydrationContext,
  isHydrating,
  setHydrationContext,
} from "./hydration-context.js";
import type { HydrationData } from "./types.js";

describe("Hydration Context", () => {
  let cleanupSSRMode: () => void;

  beforeEach(() => {
    // Enable SSR mode for all tests
    cleanupSSRMode = enableSSRMode();
  });

  afterEach(() => {
    // Restore original SSR env var
    cleanupSSRMode();

    // Clear hydration context
    clearHydrationContext();
  });

  it("should set and get hydration context", () => {
    const data: HydrationData = {
      observables: { 0: 42 },
      bindings: {},
      graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
    };

    setHydrationContext(data);
    const context = getHydrationContext();

    expect(context).toBe(data);
    expect(context!.observables[0]).toBe(42);
  });

  it("should detect hydration mode", () => {
    expect(isHydrating()).toBe(false);

    setHydrationContext({
      observables: {},
      bindings: {},
      graph: { nodes: [], rootIds: [] },
    });

    expect(isHydrating()).toBe(true);

    clearHydrationContext();

    expect(isHydrating()).toBe(false);
  });

  it("should get hydrated value by numeric ID", () => {
    const data: HydrationData = {
      observables: { 0: 100, 1: "hello" },
      bindings: {},
      graph: {
        nodes: [
          { id: 0, parents: [] },
          { id: 1, parents: [] },
        ],
        rootIds: [0, 1],
      },
    };

    setHydrationContext(data);

    expect(getHydratedValue(0)).toBe(100);
    expect(getHydratedValue(1)).toBe("hello");
    expect(getHydratedValue(999)).toBeUndefined();
  });

  it("should clear hydration context", () => {
    setHydrationContext({
      observables: { 0: 1 },
      bindings: {},
      graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
    });

    expect(isHydrating()).toBe(true);

    clearHydrationContext();

    expect(isHydrating()).toBe(false);
    expect(getHydrationContext()).toBeNull();
  });
});
