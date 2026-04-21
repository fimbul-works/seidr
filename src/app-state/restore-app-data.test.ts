import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { getAppState } from "./app-state";
import { restoreAppStateData } from "./restore-app-data";

describe("restoreAppStateData", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  it("should restore data using registered strategies", () => {
    const appState = getAppState();
    const captureFn = vi.fn();
    const restoreFn = vi.fn();

    appState.defineDataStrategy("test-key", captureFn, restoreFn);

    restoreAppStateData({
      "test-key": { foo: "bar" },
    });

    expect(restoreFn).toHaveBeenCalledWith({ foo: "bar" });
    expect(restoreFn).toHaveBeenCalledTimes(1);
  });

  it("should ignore keys without matching strategies", () => {
    const appState = getAppState();
    const restoreFn = vi.fn();

    appState.defineDataStrategy("known-key", vi.fn(), restoreFn);

    // This should not throw or cause issues
    restoreAppStateData({
      "unknown-key": "some value",
      "known-key": "actual value",
    });

    expect(restoreFn).toHaveBeenCalledWith("actual value");
    expect(restoreFn).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple strategies", () => {
    const appState = getAppState();
    const restore1 = vi.fn();
    const restore2 = vi.fn();

    appState.defineDataStrategy("key1", vi.fn(), restore1);
    appState.defineDataStrategy("key2", vi.fn(), restore2);

    restoreAppStateData({
      key1: 1,
      key2: 2,
    });

    expect(restore1).toHaveBeenCalledWith(1);
    expect(restore2).toHaveBeenCalledWith(2);
  });
});
