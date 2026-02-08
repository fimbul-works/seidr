import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-state-key";
import { symbolNames } from "./storage";
import type { StateKey } from "./types";

describe("createStateKey", () => {
  beforeEach(() => {
    symbolNames.clear();
  });

  afterEach(() => {
    symbolNames.clear();
  });

  it("should return the same symbol for the same key", () => {
    const key1 = createStateKey<number>("test");
    const key2 = createStateKey<number>("test");

    expect(typeof key1).toBe("symbol");
    expect(key1).toBe(key2);
  });

  it("should return different symbols for different keys", () => {
    const key1 = createStateKey<number>("test1");
    const key2 = createStateKey<number>("test2");
    expect(key1).not.toBe(key2);
  });

  it("should register the symbol name", () => {
    const _key = createStateKey<number>("myKey");
    expect(symbolNames.has("myKey")).toBe(true);
  });

  it("should preserve type information", () => {
    const numberKey = createStateKey<number>("number");
    const stringKey = createStateKey<string>("string");

    type _Test1 = StateKey<typeof numberKey>;
    type _Test2 = StateKey<typeof stringKey>;
  });
});
