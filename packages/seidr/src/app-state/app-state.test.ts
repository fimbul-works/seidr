import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMarkerRegistry } from "../component/component-registry";
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

    it("should remove all markers from DOM", () => {
      const start = document.createComment("start");
      const end = document.createComment("end");
      const container = document.createElement("div");
      container.appendChild(start);
      container.appendChild(end);

      getMarkerRegistry().set("test", [start, end]);

      expect(container.contains(start)).toBe(true);

      setAppStateID(1);

      expect(container.contains(start)).toBe(false);
      expect(container.contains(end)).toBe(false);
      expect(getMarkerRegistry().size).toBe(0);
    });
  });
});
