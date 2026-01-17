import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-key";
import { hasState } from "./has";
import { setState } from "./set";
import { globalStates } from "./storage";

describe("hasState", () => {
  beforeEach(() => {
    globalStates.clear();
  });

  afterEach(() => {
    globalStates.clear();
  });

  it("should return true if state exists", () => {
    const key = createStateKey<number>("test");
    setState(key, 42);

    expect(hasState(key)).toBe(true);
  });

  it("should return false if state does not exist", () => {
    const key = createStateKey<number>("nonexistent");

    expect(hasState(key)).toBe(false);
  });

  it("should return false after clearing state", () => {
    const key = createStateKey<number>("test");
    setState(key, 42);

    expect(hasState(key)).toBe(true);

    globalStates.clear();
    expect(hasState(key)).toBe(false);
  });

  describe("Documentation Examples", () => {
    it("should demonstrate checking state existence", () => {
      const SETTINGS = createStateKey<object>("settings");

      expect(hasState(SETTINGS)).toBe(false);

      setState(SETTINGS, { theme: "light" });
      expect(hasState(SETTINGS)).toBe(true);
    });
  });
});
