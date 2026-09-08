import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { createValue } from "../observable/value.js";
import { enableSSRMode, resetNextId } from "../test-setup/index.js";
import { SSRScope, setSSRScope } from "./ssr-scope.js";

const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSRScope", () => {
  let scope: SSRScope;

  beforeEach(() => {
    enableSSRMode();
    resetNextId();
    process.env.SEIDR_TEST_SSR = "true";

    scope = new SSRScope(getAppState());
  });

  afterEach(() => {
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    setSSRScope(undefined);
  });

  it("should track values created in app-state", () => {
    const val = createValue(42);

    expect(scope.size).toBe(1);
    expect(scope.get(val.id)).toBe(val);
  });

  it("should track multiple values", () => {
    const v1 = createValue(1);
    const v2 = createValue("test");
    const v3 = createValue(true);

    expect(scope.size).toBe(3);
    expect(scope.get(v1.id)).toBe(v1);
    expect(scope.get(v2.id)).toBe(v2);
    expect(scope.get(v3.id)).toBe(v3);
  });

  it("should capture state with only root values", () => {
    const root1 = createValue(10, { id: "root1" });
    const root2 = createValue("hello", { id: "root2" });
    const _derived = root1.as((x) => x * 2);

    const hydrationData = scope.captureHydrationData();

    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toHaveLength(2);
    expect(hydrationData.data[DATA_KEY_STATE]!.root1).toBe(root1());
    expect(hydrationData.data[DATA_KEY_STATE]!.root2).toBe(root2());
  });

  it("should skip values marked with hydrate: false", () => {
    createValue(10, { id: "hydrated", hydrate: true });
    createValue("secret", { id: "unhydrated", hydrate: false });

    const hydrationData = scope.captureHydrationData();

    expect(Object.keys(hydrationData.data[DATA_KEY_STATE]!)).toEqual(["hydrated"]);
    expect(hydrationData.data[DATA_KEY_STATE]!.hydrated).toBe(10);
  });

  it("should capture complex types", () => {
    const objVal = createValue({ foo: "bar", nested: { value: 42 } }, { id: "obj" });
    const arrVal = createValue([1, 2, 3], { id: "arr" });

    const hydrationData = scope.captureHydrationData();

    expect(hydrationData.data[DATA_KEY_STATE]!.obj).toEqual(objVal());
    expect(hydrationData.data[DATA_KEY_STATE]!.arr).toEqual(arrVal());
  });

  it("should clear all values and state on clear", () => {
    createValue(1);
    createValue(2);

    expect(scope.size).toBe(2);

    scope.clear();

    expect(scope.size).toBe(0);
  });

  it("should wait for registered promises", async () => {
    let resolved = false;
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => {
        resolved = true;
        resolve("done");
      }, 10);
    });

    scope.addPromise(promise);
    expect(resolved).toBe(false);

    await scope.waitForPromises();
    expect(resolved).toBe(true);
  });

  it("should wait for cascaded promises", async () => {
    const sequence: number[] = [];

    const first = new Promise<void>((resolve) => {
      setTimeout(() => {
        sequence.push(1);
        const second = new Promise<void>((res) => {
          setTimeout(() => {
            sequence.push(2);
            res();
          }, 10);
        });
        scope.addPromise(second);
        resolve();
      }, 10);
    });

    scope.addPromise(first);
    await scope.waitForPromises();

    expect(sequence).toEqual([1, 2]);
  });
});
