import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-key";
import { getState } from "./get";
import { setState } from "./set";
import { globalStates } from "./storage";
import type { InferStateType } from "./types";

describe("getState", () => {
  beforeEach(() => {
    globalStates.clear();
  });

  afterEach(() => {
    globalStates.clear();
  });

  it("should get state for a key", () => {
    const key = createStateKey<number>("test");
    setState(key, 42);

    expect(getState(key)).toBe(42);
  });

  it("should throw error if state not found", () => {
    const key = createStateKey<number>("nonexistent");

    expect(() => getState(key)).toThrow("State not found for key");
  });

  it("should preserve type information", () => {
    const numberKey = createStateKey<number>("number");
    const stringKey = createStateKey<string>("string");

    setState(numberKey, 42);
    setState(stringKey, "hello");

    const num: number = getState(numberKey);
    const str: string = getState(stringKey);

    expect(num).toBe(42);
    expect(str).toBe("hello");
  });

  it("should return the exact same object reference", () => {
    const obj = { value: 42 };
    const key = createStateKey<typeof obj>("obj");

    setState(key, obj);
    const retrieved = getState(key);

    expect(retrieved).toBe(obj);
    expect(retrieved.value).toBe(42);
  });

  describe("Documentation Examples", () => {
    it("should demonstrate getting application state", () => {
      const COUNTER = createStateKey<number>("counter");

      setState(COUNTER, 10);
      const counter = getState(COUNTER);

      expect(counter).toBe(10);
      // Type: number
    });
  });

  describe("TypeScript Type Inference", () => {
    it("should correctly infer InferStateType", () => {
      const numberKey = createStateKey<number>("number");
      type Inferred = InferStateType<typeof numberKey>;

      const value: Inferred = 42;
      expect(typeof value).toBe("number");
    });

    it("should work with complex types", () => {
      interface User {
        name: string;
        age: number;
      }

      const userKey = createStateKey<User>("user");
      type InferredUser = InferStateType<typeof userKey>;

      const user: InferredUser = { name: "Bob", age: 25 };
      expect(user.name).toBe("Bob");
    });
  });

  describe("Render Context Isolation", () => {
    it("should isolate state by render context", () => {
      const key = createStateKey<number>("test");

      // Simulate different render contexts
      // Default context has renderContextID: 0
      setState(key, 100);
      expect(getState(key)).toBe(100);

      // If we had a different render context, it would have different state
      // This is tested more thoroughly in SSR-specific tests
    });
  });
});
