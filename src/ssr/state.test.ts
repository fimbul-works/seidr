import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../core/render-context-contract";
import { globalStates } from "../core/state";
import { Seidr } from "../core/seidr";
import { symbolNames } from "../core/state";
import { runWithRenderContextSync } from "../render-context.node";
import { captureRenderContextState, restoreGlobalState } from "./state";
import { createStateKey, getState, hasState, setState } from "../core/state";

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
    it("should capture Seidr observables with $/ prefix and numeric IDs", () => {
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");
        const countKey = createStateKey<Seidr<number>>("count");

        setState(userKey, new Seidr("Alice"));
        setState(countKey, new Seidr(42));

        const state = captureState();

        // IDs: 0 for "user", 1 for "count"
        expect(state).toEqual({
          "$/0": "Alice",
          "$/1": 42,
        });
      });
    });

    it("should capture plain values with numeric IDs", () => {
      runWithRenderContextSync(() => {
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const configKey = createStateKey<{ debug: boolean }>("config");

        setState(settingsKey, { theme: "dark" });
        setState(configKey, { debug: true });

        const state = captureState();

        // IDs: 0 for "settings", 1 for "config"
        expect(state).toEqual({
          "0": { theme: "dark" },
          "1": { debug: true },
        });
      });
    });

    it("should capture mixed Seidr and plain values", () => {
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const countKey = createStateKey<Seidr<number>>("count");

        setState(userKey, new Seidr("Bob"));
        setState(settingsKey, { theme: "light" });
        setState(countKey, new Seidr(100));

        const state = captureState();

        // IDs: 0 for "user", 1 for "settings", 2 for "count"
        expect(state).toEqual({
          "$/0": "Bob",
          "1": { theme: "light" },
          "$/2": 100,
        });
      });
    });

    it("should skip derived Seidr instances", () => {
      runWithRenderContextSync(() => {
        const countKey = createStateKey<Seidr<number>>("count");
        const doubledKey = createStateKey<Seidr<number>>("doubled");

        const count = new Seidr(5);
        const doubled = count.as((n) => n * 2); // Derived

        setState(countKey, count);
        setState(doubledKey, doubled);

        const state = captureState();

        // Only non-derived Seidr should be captured
        expect(state).toEqual({
          "$/0": 5, // "count" has ID 0
        });
        expect(state).not.toHaveProperty("$/1"); // "doubled" not captured
      });
    });

    it("should return empty object when no state exists", () => {
      runWithRenderContextSync(() => {
        const state = captureState();
        expect(state).toEqual({});
      });
    });
  });

  describe("restoreGlobalState", () => {
    it("should restore Seidr observables from $/ prefixed numeric keys", () => {
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");
        const countKey = createStateKey<Seidr<number>>("count");

        restoreGlobalState({
          "$/0": "Alice", // ID 0 for "user"
          "$/1": 42, // ID 1 for "count"
        });

        const user = getState<Seidr<string>>(userKey);
        const count = getState<Seidr<number>>(countKey);

        expect(user).toBeInstanceOf(Seidr);
        expect(user.value).toBe("Alice");
        expect(count).toBeInstanceOf(Seidr);
        expect(count.value).toBe(42);
      });
    });

    it("should restore plain values from numeric keys", () => {
      runWithRenderContextSync(() => {
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const configKey = createStateKey<{ debug: boolean }>("config");

        restoreGlobalState({
          "0": { theme: "dark" }, // ID 0 for "settings"
          "1": { debug: true }, // ID 1 for "config"
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
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");
        const settingsKey = createStateKey<{ theme: string }>("settings");
        const countKey = createStateKey<Seidr<number>>("count");

        restoreGlobalState({
          "$/0": "Bob",
          "1": { theme: "light" },
          "$/2": 100,
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
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");

        setState(userKey, new Seidr("Initial"));

        restoreGlobalState({
          "$/0": "Updated", // ID 0 for "user"
        });

        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("Updated");
      });
    });

    it("should create new Seidr instances if they don't exist", () => {
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");

        expect(hasState(userKey)).toBe(false);

        restoreGlobalState({
          "$/0": "New User", // ID 0 for "user"
        });

        expect(hasState(userKey)).toBe(true);
        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("New User");
      });
    });

    it("should overwrite existing plain values", () => {
      runWithRenderContextSync(() => {
        const settingsKey = createStateKey<{ theme: string }>("settings");

        setState(settingsKey, { theme: "dark" });

        restoreGlobalState({
          "0": { theme: "light" }, // ID 0 for "settings"
        });

        const settings = getState<{ theme: string }>(settingsKey);
        expect(settings).toEqual({ theme: "light" });
      });
    });

    it("should ignore unknown numeric IDs", () => {
      runWithRenderContextSync(() => {
        const userKey = createStateKey<Seidr<string>>("user");

        restoreGlobalState({
          "$/0": "Alice",
          "$/99": "value", // This ID doesn't exist
          "99": { theme: "dark" }, // This ID doesn't exist
        });

        const user = getState<Seidr<string>>(userKey);
        expect(user.value).toBe("Alice");
      });
    });
  });

  describe("Round-trip serialization", () => {
    it("should preserve data through serialize -> deserialize cycle", () => {
      runWithRenderContextSync(() => {
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
      runWithRenderContextSync(() => {
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
      runWithRenderContextSync(() => {
        const todosKey = createStateKey<Seidr<Todo[]>>("todos");

        type Todo = { id: number; text: string; completed: boolean };

        const todoProps: Todo[] = [
          { id: 1, text: "Learn Seidr", completed: false },
          { id: 2, text: "Build apps", completed: false },
        ];

        restoreGlobalState({
          "$/0": todoProps, // ID 0 for "todos"
        });

        const todos = getState<Seidr<Todo[]>>(todosKey);

        expect(todos).toBeInstanceOf(Seidr);
        expect(todos.value).toEqual(todoProps);
      });
    });

    it("should handle conditional state initialization", () => {
      runWithRenderContextSync(() => {
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
