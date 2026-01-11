import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { enableSSRMode } from "../test-setup";
import { clearHydrationData, hasHydrationData, setHydrationData } from "./hydration-context";

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
    expect(hasHydrationData()).toBe(false);

    setHydrationData({
      observables: {},
      bindings: {},
      graph: { nodes: [], rootIds: [] },
    });

    expect(hasHydrationData()).toBe(true);

    clearHydrationData();

    expect(hasHydrationData()).toBe(false);
  });
});
