import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStateKey } from "./create-key";
import { getState } from "./get";
import { getSetState } from "./get-set";
import { setState } from "./set";
import { globalStates } from "./storage";

describe("getSetState", () => {
  beforeEach(() => {
    globalStates.clear();
  });

  afterEach(() => {
    globalStates.clear();
  });

  it("should get and set state", () => {
    const keyStr = "count";
    const key = createStateKey<number>(keyStr);
    // Initialize state
    setState(key, 0);

    const count = getSetState<number>(keyStr);
    expect(count()).toBe(0);

    const oldVal = count(1);
    expect(oldVal).toBe(0); // Returns previous value
    expect(count()).toBe(1); // Returns new value
    expect(getState(key)).toBe(1);
  });

  it("should handle dynamic updates", () => {
    const keyStr = "dynamic";
    const key = createStateKey<number>(keyStr);
    setState(key, 10);

    const stateFn = getSetState<number>(keyStr);
    expect(stateFn()).toBe(10);

    // Update state externally
    setState(key, 20);
    expect(stateFn()).toBe(20); // Should NOT be stale
  });

  it("should return undefined if state is missing", () => {
    const stateFn = getSetState<number>("missing");
    expect(stateFn()).toBeUndefined();

    // Setting a value should initialize it
    stateFn(42);
    expect(stateFn()).toBe(42);
  });
});
