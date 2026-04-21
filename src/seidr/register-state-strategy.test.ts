import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { DATA_KEY_STATE } from "./constants";
import { registerStateStrategy } from "./register-state-strategy";
import { Seidr } from "./seidr";

describe("registerStateStrategy", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
    const appState = getAppState();
    registerStateStrategy(appState);
  });

  afterEach(() => {
    restore();
  });

  describe("capture", () => {
    it("should capture root observables", () => {
      const appState = getAppState();
      const _s1 = new Seidr(1, { id: "s1" });
      const _s2 = new Seidr("two", { id: "s2" });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toEqual({
        s1: 1,
        s2: "two",
      });
    });

    it("should skip derived observables", () => {
      const appState = getAppState();
      const root = new Seidr(10, { id: "root" });
      const _derived = root.as((v) => v * 2, { id: "derived" });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toHaveProperty("root", 10);
      expect(data).not.toHaveProperty("derived");
    });

    it("should skip observables with hydrate: false", () => {
      const appState = getAppState();
      const _s1 = new Seidr(1, { id: "s1" });
      const _s2 = new Seidr(2, { id: "s2", hydrate: false });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toHaveProperty("s1", 1);
      expect(data).not.toHaveProperty("s2");
    });
  });

  describe("restore", () => {
    it("should update existing Seidr instances", () => {
      const appState = getAppState();
      const s1 = new Seidr(1, { id: "s1" });

      const restoreFn = appState.getDataStrategy(DATA_KEY_STATE)![1];
      restoreFn({ s1: 100 });

      expect(s1.value).toBe(100);
    });

    it("should create new Seidr instances if they don't exist", () => {
      const appState = getAppState();
      const restoreFn = appState.getDataStrategy(DATA_KEY_STATE)![1];

      restoreFn({ newSeidr: "hello" });

      const observables = appState.getData<Map<string, Seidr>>(DATA_KEY_STATE);
      expect(observables?.has("newSeidr")).toBe(true);
      expect(observables?.get("newSeidr")?.value).toBe("hello");
    });
  });

  describe("cleanup", () => {
    it("should destroy all Seidr instances and clear the map", () => {
      const appState = getAppState();
      const s1 = new Seidr(1, { id: "s1" });
      const s2 = new Seidr(2, { id: "s2" });

      const destroySpy1 = vi.spyOn(s1, "destroy");
      const destroySpy2 = vi.spyOn(s2, "destroy");

      const cleanupFn = appState.getDataStrategy(DATA_KEY_STATE)![2]!;
      cleanupFn();

      expect(destroySpy1).toHaveBeenCalled();
      expect(destroySpy2).toHaveBeenCalled();

      const observables = appState.getData<Map<string, Seidr>>(DATA_KEY_STATE);
      expect(observables?.size).toBe(0);
    });
  });
});
