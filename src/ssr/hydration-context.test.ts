import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../core/render-context-contract.js";
import { enableSSRMode } from "../test-setup.js";
import { clearHydrationContext, getHydrationContext, isHydrating, setHydrationContext } from "./hydration-context.js";
import type { HydrationData } from "./types.js";

describe("Hydration Context", () => {
  let cleanupSSRMode: () => void;
  const ctx = getRenderContext();

  beforeEach(() => {
    // Enable SSR mode for all tests
    cleanupSSRMode = enableSSRMode();
  });

  afterEach(() => {
    // Restore original SSR env var
    cleanupSSRMode();

    // Clear hydration context
    clearHydrationContext(ctx!.renderContextID);
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

    clearHydrationContext(ctx!.renderContextID);

    expect(isHydrating()).toBe(false);
  });

  it("should clear hydration context", () => {
    setHydrationContext({
      observables: { 0: 1 },
      bindings: {},
      graph: { nodes: [{ id: 0, parents: [] }], rootIds: [0] },
    });

    expect(isHydrating()).toBe(true);

    clearHydrationContext(ctx!.renderContextID);

    expect(isHydrating()).toBe(false);
    expect(getHydrationContext()).toBeNull();
  });
});
