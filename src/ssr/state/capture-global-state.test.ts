import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../../render-context/render-context";
import { runWithRenderContext } from "../../render-context/render-context.node";
import { Seidr } from "../../seidr";
import { globalStates, symbolNames } from "../../state/storage";
import { useState } from "../../state/use-state";
import { captureGlobalState } from "./capture-global-state";

describe("captureGlobalState", () => {
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
    return captureGlobalState(ctx.ctxID);
  };

  it("should capture mixed Seidr and plain values", () => {
    runWithRenderContext(async () => {
      const [, setUser] = useState<Seidr<string>>("user");
      const [, setSettings] = useState<{ theme: string }>("settings");
      const [, setCount] = useState<Seidr<number>>("count");

      setUser(new Seidr("Bob"));
      setSettings({ theme: "light" });
      setCount(new Seidr(100));

      const state = captureState();

      expect(state).toEqual({
        user: "Bob",
        settings: { theme: "light" },
        count: 100,
      });
    });
  });

  it("should skip derived Seidr instances", () => {
    runWithRenderContext(async () => {
      const [count, setCount] = useState<number>("count");
      const [, setDoubled] = useState<number>("doubled");

      setCount(5);
      setDoubled(count.as((n) => n * 2));

      const state = captureState();

      expect(state).toEqual({
        count: 5,
      });
      expect(state).not.toHaveProperty("doubled");
    });
  });

  it("should return empty object when no state exists", () => {
    runWithRenderContext(async () => {
      const state = captureState();
      expect(state).toEqual({});
    });
  });
});
