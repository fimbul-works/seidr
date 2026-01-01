import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { enableSSRMode } from "../test-setup";
import { clearHydrationData, isHydrating, setHydrationData } from "./hydration-context";

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
    clearHydrationData();
  });

  it("should detect hydration mode", () => {
    expect(isHydrating()).toBe(false);

    setHydrationData({
      elementIds: [],
      observables: {},
      bindings: {},
      graph: { nodes: [], rootIds: [] },
    });

    expect(isHydrating()).toBe(true);

    clearHydrationData();

    expect(isHydrating()).toBe(false);
  });
});
