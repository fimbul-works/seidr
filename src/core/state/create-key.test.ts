import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-key";
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
    expect(key1).toBe(key2); // Symbols are reused for same key
  });

  it("should return different symbols for different keys", () => {
    const key1 = createStateKey<number>("test1");
    const key2 = createStateKey<number>("test2");
    expect(key1).not.toBe(key2);
  });

  it("should register the symbol name", () => {
    const key = createStateKey<number>("myKey");
    expect(symbolNames.has("myKey")).toBe(true);
  });

  it("should preserve type information", () => {
    const numberKey = createStateKey<number>("number");
    const stringKey = createStateKey<string>("string");

    // TypeScript should infer types correctly
    type Test1 = StateKey<typeof numberKey>;
    type Test2 = StateKey<typeof stringKey>;
  });

  describe("Documentation Examples", () => {
    it("should demonstrate type-safe state keys", () => {
      const USER_ID = createStateKey<number>("userId");
      const USER_NAME = createStateKey<string>("userName");

      // Type-safe: can only store numbers with USER_ID
      // Type-safe: can only store strings with USER_NAME
      expect(typeof USER_ID).toBe("symbol");
      expect(typeof USER_NAME).toBe("symbol");
    });
  });
});
