import { encodeBase62 } from "@fimbul-works/futhark";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent } from "../component/create-component";
import { setComponentScope } from "../component/lifecycle/component-scope";
import { $ } from "../element";
import { createValue } from "../observable";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { getAppState, getNextValueId, setAppStateID } from "./app-state";

describe("AppState Infrastructure", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  describe("setAppStateID", () => {
    it("should update ctxID and reset counter", () => {
      const state = getAppState();
      state.uniqID = 42;

      setAppStateID(100);

      expect(state.ctxID).toBe(100);
      expect(state.uniqID).toBe(0);
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
      const state = getAppState();
      const start = document.createComment("start");
      const end = document.createComment("end");
      const container = document.createElement("div");
      container.appendChild(start);
      container.appendChild(end);

      state.markers.set("test", [start, end]);

      expect(container.contains(start)).toBe(true);

      setAppStateID(1);

      expect(container.contains(start)).toBe(false);
      expect(container.contains(end)).toBe(false);
      expect(state.markers.size).toBe(0);
    });
  });

  describe("getNextSeidrId", () => {
    it("should generate deterministic IDs within component scope", () => {
      const TestComp = createComponent(() => {
        const id1 = getNextValueId();
        const id2 = getNextValueId();
        return $("div", { id: id1, className: id2 });
      }, "Test");

      const comp1 = TestComp();
      const el1 = comp1.nodes[0] as HTMLElement;

      // ID format is: [ComponentIDBase62]-[CounterBase62]
      expect(el1.id).toBe(`${encodeBase62(comp1.id)}-1`);
      expect(el1.className).toBe(`${encodeBase62(comp1.id)}-2`);

      const comp2 = TestComp();
      const el2 = comp2.nodes[0] as HTMLElement;
      expect(el2.id).toBe(`${encodeBase62(comp2.id)}-1`);
    });

    it("should fallback to AppState counter when outside of scope", () => {
      setComponentScope(null);
      const state = getAppState();
      state.uniqID = 10;

      const id = getNextValueId();
      // 10 in base62 is 'a'
      expect(id).toBe("a");
      expect(state.uniqID).toBe(11);
    });

    it("should warn on server when outside of scope", () => {
      const cleanup = enableSSRMode();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        setComponentScope(null);
        getNextValueId();

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Generating Value ID outside of component scope"),
        );
      } finally {
        cleanup();
        consoleSpy.mockRestore();
      }
    });
  });
});
