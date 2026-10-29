import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createValue } from "../observable";
import { describeDualMode, enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { getAppState, setAppStateID } from "./get-app-state";

describeDualMode("AppState Infrastructure", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  describe("setAppStateID", () => {
    it("should update ctxID", () => {
      const state = getAppState();

      setAppStateID(100);

      expect(state.ctxID).toBe(100);
    });

    it("should clear all data including observable instances", () => {
      const state = getAppState();
      const s1 = createValue(1);
      const destroySpy = vi.spyOn(s1, "destroy");

      state.setData("custom", "value");
      state.setData("seidr", s1);

      expect(state.hasData("custom")).toBe(true);

      setAppStateID(1);

      expect(state.hasData("custom")).toBe(false);
      expect(state.hasData("seidr")).toBe(false);
      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
