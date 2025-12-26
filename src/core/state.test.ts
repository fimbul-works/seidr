import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createStateKey,
  getState,
  hasState,
  type InferStateType,
  renderContextStates,
  State,
  type StateKey,
  setState,
  symbolNames,
} from "./state";

describe("State", () => {
  beforeEach(() => {
    // Clear all render context states before each test
    renderContextStates.clear();
    symbolNames.clear();
  });

  afterEach(() => {
    // Clean up after each test
    renderContextStates.clear();
    symbolNames.clear();
  });

  describe("State Class", () => {
    it("should create a State instance with a value", () => {
      const state = new State(42);
      expect(state.get()).toBe(42);
    });

    it("should store complex objects", () => {
      const obj = { name: "test", value: 100 };
      const state = new State(obj);
      expect(state.get()).toEqual(obj);
    });

    it("should store null values", () => {
      const state = new State<string | null>(null);
      expect(state.get()).toBeNull();
    });

    it("should store undefined values", () => {
      const state = new State<string | undefined>(undefined);
      expect(state.get()).toBeUndefined();
    });

    it("should type-check correctly with TypeScript", () => {
      const state = new State<number>(42);
      const value: number = state.get();
      expect(typeof value).toBe("number");
    });

    describe("Documentation Examples", () => {
      it("should demonstrate basic State usage", () => {
        const counterState = new State(0);
        expect(counterState.get()).toBe(0);

        counterState.get(); // Type: number
      });

      it("should demonstrate State with complex object", () => {
        interface User {
          name: string;
          age: number;
        }

        const userState = new State<User>({
          name: "Alice",
          age: 30,
        });

        const user = userState.get();
        expect(user.name).toBe("Alice");
        expect(user.age).toBe(30);
      });
    });
  });

  describe("createStateKey", () => {
    it("should create a unique symbol key", () => {
      const key1 = createStateKey<number>("test");
      const key2 = createStateKey<number>("test");

      expect(typeof key1).toBe("symbol");
      expect(key1).not.toBe(key2); // Symbols are unique
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

  describe("setState", () => {
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

  describe("getState", () => {
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
  });

  describe("hasState", () => {
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

      renderContextStates.clear();
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

  describe("TypeScript Type Inference", () => {
    it("should correctly infer InferStateType", () => {
      const state = new State<number>(42);
      type Inferred = InferStateType<typeof state>;

      const value: Inferred = 42;
      expect(typeof value).toBe("number");
    });

    it("should work with complex types", () => {
      interface User {
        name: string;
        age: number;
      }

      const userState = new State<User>({ name: "Alice", age: 30 });
      type InferredUser = InferStateType<typeof userState>;

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
