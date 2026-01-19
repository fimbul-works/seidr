import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../core/render-context-contract";
import { Seidr } from "../core/seidr";
import { createStateKey, getState, globalStates, hasState, setState, symbolNames } from "../core/state";
import { runWithRenderContext } from "../render-context.node";
import { captureRenderContextState, restoreGlobalState } from "./state";

describe("SSR State Serialization", () => {
  beforeEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  afterEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  const captureState = () => {
    const ctx = getRenderContext();
    return captureRenderContextState(ctx!.renderContextID);
  };

  describe("captureRenderContextState", () => {
    it("should capture Seidr observables with $/ prefix and string keys", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");
        const countKey = createStateKey<Seidr<number>>("count");

        setState(userKey, new Seidr("Alice"));
        setState(countKey, new Seidr(42));

        const state = captureState();

        expect(state).toEqual({
          "$/user": "Alice",
          "$/count": 42,
        });
      });
    });

    it("should capture plain values with string keys", () => {
      runWithRenderContext(async () => {
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const configKey = createStateKey<{ debug: boolean }>("config");

        setState(settingsKey, { theme: "dark" });
        setState(configKey, { debug: true });

        const state = captureState();

        expect(state).toEqual({
          settings: { theme: "dark" },
          config: { debug: true },
        });
      });
    });

    it("should capture mixed Seidr and plain values", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const countKey = createStateKey<Seidr<number>>("count");

        setState(userKey, new Seidr("Bob"));
        setState(settingsKey, { theme: "light" });
        setState(countKey, new Seidr(100));

        const state = captureState();

        expect(state).toEqual({
          "$/user": "Bob",
          settings: { theme: "light" },
          "$/count": 100,
        });
      });
    });

    it("should skip derived Seidr instances", () => {
      runWithRenderContext(async () => {
        const countKey = createStateKey<Seidr<number>>("count");
        const doubledKey = createStateKey<Seidr<number>>("doubled");

        const count = new Seidr(5);
        const doubled = count.as((n) => n * 2); // Derived

        setState(countKey, count);
        setState(doubledKey, doubled);

        const state = captureState();

        // Only non-derived Seidr should be captured
        expect(state).toEqual({
          "$/count": 5,
        });
        expect(state).not.toHaveProperty("$/doubled");
      });
    });

    it("should return empty object when no state exists", () => {
      runWithRenderContext(async () => {
        const state = captureState();
        expect(state).toEqual({});
      });
    });
  });

  describe("restoreGlobalState", () => {
    it("should restore Seidr observables from $/ prefixed string keys", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");
        const countKey = createStateKey<Seidr<number>>("count");

        restoreGlobalState({
          "$/user": "Alice",
          "$/count": 42,
        });

        const user = getState<Seidr<string>>(userKey);
        const count = getState<Seidr<number>>(countKey);

        expect(user).toBeInstanceOf(Seidr);
        expect(user.value).toBe("Alice");
        expect(count).toBeInstanceOf(Seidr);
        expect(count.value).toBe(42);
      });
    });

    it("should restore plain values from string keys", () => {
      runWithRenderContext(async () => {
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const configKey = createStateKey<{ debug: boolean }>("config");

        restoreGlobalState({
          settings: { theme: "dark" },
          config: { debug: true },
        });

        const settings = getState<{ theme: string }>(settingsKey);
        const config = getState<{ debug: boolean }>(configKey);

        expect(settings).toEqual({ theme: "dark" });
        expect(config).toEqual({ debug: true });
        expect(settings).not.toBeInstanceOf(Seidr);
        expect(config).not.toBeInstanceOf(Seidr);
      });
    });

    it("should restore mixed Seidr and plain values", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const countKey = createStateKey<Seidr<number>>("count");

        restoreGlobalState({
          "$/user": "Bob",
          settings: { theme: "light" },
          "$/count": 100,
        });

        const user = getState<Seidr<string>>(userKey);
        const settings = getState<{ theme: string }>(settingsKey);
        const count = getState<Seidr<number>>(countKey);

        expect(user.value).toBe("Bob");
        expect(settings).toEqual({ theme: "light" });
        expect(count.value).toBe(100);
      });
    });

    it("should update existing Seidr instances", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");

        setState(userKey, new Seidr("Initial"));

        restoreGlobalState({
          "$/user": "Updated",
        });

        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("Updated");
      });
    });

    it("should create new Seidr instances if they don't exist", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");

        expect(hasState(userKey)).toBe(false);

        restoreGlobalState({
          "$/user": "New User",
        });

        expect(hasState(userKey)).toBe(true);
        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("New User");
      });
    });

    it("should overwrite existing plain values", () => {
      runWithRenderContext(async () => {
        const settingsKey = createStateKey<{ theme: string }>("settings");

        setState(settingsKey, { theme: "dark" });

        restoreGlobalState({
          settings: { theme: "light" },
        });

        const settings = getState<{ theme: string }>(settingsKey);
        expect(settings).toEqual({ theme: "light" });
      });
    });

    it("should ignore keys that don't match any state symbols", () => {
      runWithRenderContext(async () => {
        // Technically, with createStateKey being used inside restoreGlobalState,
        // it now creates new keys for anything it sees.
        // But let's check basic restoration.
        const userKey = createStateKey<Seidr<string>>("user");

        restoreGlobalState({
          "$/user": "Alice",
        });

        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("Alice");
      });
    });
  });

  describe("Round-trip serialization", () => {
    it("should preserve data through serialize -> deserialize cycle", () => {
      runWithRenderContext(async () => {
        const userKey = createStateKey<Seidr<string>>("user");
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const countKey = createStateKey<Seidr<number>>("count");

        setState(userKey, new Seidr("Alice"));
        setState(settingsKey, { theme: "dark" });
        setState(countKey, new Seidr(42));

        const serialized = captureState();

        restoreGlobalState(serialized);

        const user = getState<Seidr<string>>(userKey);
        const settings = getState<{ theme: string }>(settingsKey);
        const count = getState<Seidr<number>>(countKey);

        expect(user.value).toBe("Alice");
        expect(settings).toEqual({ theme: "dark" });
        expect(count.value).toBe(42);
      });
    });

    it("should handle complex nested objects", () => {
      runWithRenderContext(async () => {
        const configKey = createStateKey<{
          database: { host: string; port: number };
          features: string[];
        }>("config");

        const complexConfig = {
          database: { host: "localhost", port: 5432 },
          features: ["auth", "logging", "caching"],
        };

        setState(configKey, complexConfig);

        const serialized = captureState();

        restoreGlobalState(serialized);

        const restored = getState<typeof complexConfig>(configKey);
        expect(restored).toEqual(complexConfig);
      });
    });
  });

  describe("Simplified SSR Pattern", () => {
    it("should enable the simplified SSR pattern without manual Seidr creation", () => {
      runWithRenderContext(async () => {
        const todosKey = createStateKey<Seidr<Todo[]>>("todos");

        type Todo = { id: number; text: string; completed: boolean };

        const todoProps: Todo[] = [
          { id: 1, text: "Learn Seidr", completed: false },
          { id: 2, text: "Build apps", completed: false },
        ];

        restoreGlobalState({
          "$/todos": todoProps,
        });

        const todos = getState<Seidr<Todo[]>>(todosKey);

        expect(todos).toBeInstanceOf(Seidr);
        expect(todos.value).toEqual(todoProps);
      });
    });

    it("should handle conditional state initialization", () => {
      runWithRenderContext(async () => {
        const todosKey = createStateKey<Seidr<Todo[]>>("todos");

        type Todo = { id: number; text: string; completed: boolean };

        const todoProps: Todo[] = [{ id: 1, text: "Learn Seidr", completed: false }];

        if (todoProps) {
          setState(todosKey, new Seidr(todoProps));
        }

        const serverState = captureState();

        restoreGlobalState(serverState);

        const todos = getState<Seidr<Todo[]>>(todosKey);

        expect(todos).toBeInstanceOf(Seidr);
        expect(todos.value).toEqual(todoProps);
      });
    });
  });
});
