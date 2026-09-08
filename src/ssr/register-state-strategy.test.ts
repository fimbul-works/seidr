import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { createValue, type Value } from "../observable/value.js";
import { enableClientMode } from "../test-setup/index.js";
import type { CleanupFunction } from "../types.js";
import { registerStateStrategy } from "./register-state-strategy.js";

describe("registerStateStrategy", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
    registerStateStrategy();
  });

  afterEach(() => {
    restore();
  });

  describe("capture", () => {
    it("should capture root observables", () => {
      const appState = getAppState();
      const _s1 = createValue(1, { id: "s1" });
      const _s2 = createValue("two", { id: "s2" });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toEqual({
        s1: 1,
        s2: "two",
      });
    });

    it("should skip derived observables", () => {
      const appState = getAppState();
      const root = createValue(10, { id: "root" });
      const _derived = root.as((v) => v * 2, { id: "derived" });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toHaveProperty("root", 10);
      expect(data).not.toHaveProperty("derived");
    });

    it("should skip observables with hydrate: false", () => {
      const appState = getAppState();
      const _s1 = createValue(1, { id: "s1" });
      const _s2 = createValue(2, { id: "s2", hydrate: false });

      const captureFn = appState.getDataStrategy(DATA_KEY_STATE)![0];
      const data = captureFn();

      expect(data).toHaveProperty("s1", 1);
      expect(data).not.toHaveProperty("s2");
    });
  });

  describe("restore", () => {
    it("should update existing Value instances", () => {
      const appState = getAppState();
      const s1 = createValue(1, { id: "s1" });

      const restoreFn = appState.getDataStrategy(DATA_KEY_STATE)![1];
      restoreFn({ s1: 100 });

      expect(s1()).toBe(100);
    });

    it("should create new Value instances if they don't exist", () => {
      const appState = getAppState();
      const restoreFn = appState.getDataStrategy(DATA_KEY_STATE)![1];

      restoreFn({ newValue: "hello" });

      const values = appState.getData<Map<string, Value>>(DATA_KEY_STATE);
      expect(values?.has("newValue")).toBe(true);
      expect(values?.get("newValue")?.()).toBe("hello");
    });
  });
});
