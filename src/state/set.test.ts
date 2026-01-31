import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-key";
import { getState } from "./get";
import { hasState } from "./has";
import { setState } from "./set";
import { globalStates } from "./storage";

describe("setState", () => {
  beforeEach(() => {
    globalStates.clear();
  });

  afterEach(() => {
    globalStates.clear();
  });

  it("should set state for a key", () => {
    const key = createStateKey<number>("test");
    setState(key, 42);

    expect(hasState(key)).toBe(true);
  });

  it("should overwrite existing state", () => {
    const key = createStateKey<number>("test");
    setState(key, 10);
    setState(key, 20);

    expect(getState(key)).toBe(20);
  });

  it("should store different types for different keys", () => {
    const numKey = createStateKey<number>("num");
    const strKey = createStateKey<string>("str");
    const boolKey = createStateKey<boolean>("bool");

    setState(numKey, 42);
    setState(strKey, "hello");
    setState(boolKey, true);

    expect(getState(numKey)).toBe(42);
    expect(getState(strKey)).toBe("hello");
    expect(getState(boolKey)).toBe(true);
  });

  it("should store complex objects", () => {
    interface Config {
      theme: string;
      fontSize: number;
    }

    const configKey = createStateKey<Config>("config");
    const config: Config = { theme: "dark", fontSize: 14 };

    setState(configKey, config);
    expect(getState(configKey)).toEqual(config);
  });

  it("should store arrays", () => {
    const listKey = createStateKey<number[]>("list");
    const list = [1, 2, 3, 4, 5];

    setState(listKey, list);
    expect(getState(listKey)).toEqual(list);
  });

  describe("Documentation Examples", () => {
    it("should demonstrate setting application state", () => {
      const THEME = createStateKey<string>("theme");

      setState(THEME, "dark");
      expect(hasState(THEME)).toBe(true);
      expect(getState(THEME)).toBe("dark");
    });
  });
});
