import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { component } from "../component/component";
import { setScope } from "../component/set-scope";
import { $ } from "../element";
import { Seidr } from "../seidr/seidr";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { getAppState, getNextSeidrId, setAppStateID } from "./app-state";

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
      state.seidrIdCounter = 42;

      setAppStateID(100);

      expect(state.ctxID).toBe(100);
      expect(state.seidrIdCounter).toBe(0);
    });

    it("should clear all data including Seidr instances", () => {
      const state = getAppState();
      const s1 = new Seidr(1);
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
      const TestComp = component(() => {
        const id1 = getNextSeidrId();
        const id2 = getNextSeidrId();
        return $("div", { id: id1, className: id2 });
      }, "Test");

      const comp1 = TestComp();
      const el1 = comp1.element as HTMLElement;

      // ID format is: [ComponentID]-[CounterBase62]
      expect(el1.id).toBe(`${comp1.id}-1`);
      expect(el1.className).toBe(`${comp1.id}-2`);

      const comp2 = TestComp();
      const el2 = comp2.element as HTMLElement;
      expect(el2.id).toBe(`${comp2.id}-1`);
    });

    it("should fallback to AppState counter when outside of scope", () => {
      setScope(null);
      const state = getAppState();
      state.seidrIdCounter = 10;

      const id = getNextSeidrId();
      // 10 in base62 is 'a'
      expect(id).toBe("a");
      expect(state.seidrIdCounter).toBe(11);
    });

    it("should warn on server when outside of scope", () => {
      const cleanup = enableSSRMode();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        setScope(null);
        getNextSeidrId();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Generating Seidr ID outside of component scope"));
      } finally {
        cleanup();
        consoleSpy.mockRestore();
      }
    });
  });
});
