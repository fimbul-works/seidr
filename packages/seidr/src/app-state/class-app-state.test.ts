import { afterEach, describe, expect, it, vi } from "vitest";
import { clearComponentRegistry, getMarkerRegistry } from "../component/component-registry";
import { createValue } from "../observable";
import { AppState } from "./class-app-state";

describe("AppState class", () => {
  afterEach(clearComponentRegistry);
  it("should initialize with default values", () => {
    const state = new AppState(1);
    expect(state.ctxID).toBe(1);
    expect(state.data).toBeInstanceOf(Map);
    expect(state.strategies).toBeInstanceOf(Map);
    expect(getMarkerRegistry()).toBeInstanceOf(Map);
  });

  describe("data management", () => {
    it("should set and get data", () => {
      const state = new AppState(1);
      state.setData("key", "value");
      expect(state.hasData("key")).toBe(true);
      expect(state.getData("key")).toBe("value");
    });

    it("should delete data", () => {
      const state = new AppState(1);
      state.setData("key", "value");
      expect(state.deleteData("key")).toBe(true);
      expect(state.hasData("key")).toBe(false);
    });

    it("should return undefined for missing data", () => {
      const state = new AppState(1);
      expect(state.getData("missing")).toBeUndefined();
    });
  });

  describe("strategy management", () => {
    it("should define and get data strategies", () => {
      const state = new AppState(1);
      const captureFn = () => ({});
      const restoreFn = () => {};

      state.defineDataStrategy("test", captureFn, restoreFn);

      const strategy = state.getDataStrategy("test");
      expect(strategy).toEqual([captureFn, restoreFn]);
    });

    it("should execute restoreFn if hydration data exists for key", () => {
      const state = new AppState(1);
      state.setData("seidr.hydration.data", {
        data: {
          test: "restored-value",
        },
      });

      const restoreSpy = vi.fn();
      state.defineDataStrategy("test", () => ({}), restoreSpy);

      expect(restoreSpy).toHaveBeenCalledWith("restored-value");
    });
  });

  describe("destroy()", () => {
    it("should clear data and destroy observable instances", () => {
      const state = new AppState(1);
      const s1 = createValue(1);
      const destroySpy = vi.spyOn(s1, "destroy");

      state.setData("s1", s1);
      state.setData("other", "value");

      state.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(state.data.size).toBe(0);
    });
  });
});
