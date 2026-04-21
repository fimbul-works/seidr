import { describe, expect, it, vi } from "vitest";
import { Seidr } from "../seidr/seidr";
import { createAppState } from "./create-app-state";

describe("createAppState", () => {
  it("should initialize with default values", () => {
    const state = createAppState(1);
    expect(state.ctxID).toBe(1);
    expect(state.seidrIdCounter).toBe(0);
    expect(state.data).toBeInstanceOf(Map);
    expect(state.strategies).toBeInstanceOf(Map);
    expect(state.markers).toBeInstanceOf(Map);
  });

  describe("data management", () => {
    it("should set and get data", () => {
      const state = createAppState(1);
      state.setData("key", "value");
      expect(state.hasData("key")).toBe(true);
      expect(state.getData("key")).toBe("value");
    });

    it("should delete data", () => {
      const state = createAppState(1);
      state.setData("key", "value");
      expect(state.deleteData("key")).toBe(true);
      expect(state.hasData("key")).toBe(false);
    });

    it("should return undefined for missing data", () => {
      const state = createAppState(1);
      expect(state.getData("missing")).toBeUndefined();
    });
  });

  describe("strategy management", () => {
    it("should define and get data strategies", () => {
      const state = createAppState(1);
      const captureFn = () => ({});
      const restoreFn = () => {};

      state.defineDataStrategy("test", captureFn, restoreFn);

      const strategy = state.getDataStrategy("test");
      expect(strategy).toEqual([captureFn, restoreFn]);
    });
  });

  describe("destroy()", () => {
    it("should clear data and destroy Seidr instances", () => {
      const state = createAppState(1);
      const s1 = new Seidr(1);
      const destroySpy = vi.spyOn(s1, "destroy");

      state.setData("s1", s1);
      state.setData("other", "value");

      state.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(state.data.size).toBe(0);
    });

    it("should remove markers from DOM", () => {
      const state = createAppState(1);
      const start = document.createComment("start");
      const end = document.createComment("end");
      const container = document.createElement("div");
      container.appendChild(start);
      container.appendChild(end);

      state.markers.set("test", [start, end]);

      state.destroy();

      expect(container.contains(start)).toBe(false);
      expect(container.contains(end)).toBe(false);
      expect(state.markers.size).toBe(0);
    });
  });
});
