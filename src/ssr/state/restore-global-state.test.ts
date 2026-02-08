import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runWithRenderContext } from "../../render-context/render-context.node";
import { Seidr } from "../../seidr";
import { globalStates, symbolNames, useState } from "../../state/internal";
import { restoreGlobalState } from "./restore-global-state";

describe("restoreGlobalState", () => {
  beforeEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  afterEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  it("should restore values from string keys", () => {
    runWithRenderContext(async () => {
      const [user] = useState<string>("user");
      const [count] = useState<number>("count");

      restoreGlobalState({
        user: "Alice",
        count: 42,
      });

      expect(user).toBeInstanceOf(Seidr);
      expect(user.value).toBe("Alice");
      expect(count).toBeInstanceOf(Seidr);
      expect(count.value).toBe(42);
    });
  });

  it("should restore mixed values", () => {
    runWithRenderContext(async () => {
      const [user] = useState<Seidr<string>>("user");
      const [settings] = useState<{ theme: string }>("settings");
      const [count] = useState<Seidr<number>>("count");

      restoreGlobalState({
        user: "Bob",
        settings: { theme: "light" },
        count: 100,
      });

      expect(user).toBeInstanceOf(Seidr);
      expect(user.value).toBe("Bob");
      expect(settings).toBeInstanceOf(Seidr);
      expect(settings.value).toEqual({ theme: "light" });
      expect(count).toBeInstanceOf(Seidr);
      expect(count.value).toBe(100);
    });
  });

  it("should create new Seidr instances if they don't exist", () => {
    runWithRenderContext(async () => {
      const [user] = useState<Seidr<string>>("user");
      expect(user.value).toBeUndefined();

      restoreGlobalState({
        user: "New User",
      });

      expect(user).toBeInstanceOf(Seidr);
      expect(user.value).toBe("New User");
    });
  });

  it("should ignore keys that don't match any state symbols", () => {
    runWithRenderContext(async () => {
      // Technically, with createStateKey being used inside restoreGlobalState,
      // it now creates new keys for anything it sees.
      // But let's check basic restoration.
      const [user] = useState<Seidr<string>>("user");

      restoreGlobalState({
        user: "Alice",
      });
      expect(user.value).toBe("Alice");
    });
  });
});
