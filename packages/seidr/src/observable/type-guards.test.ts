import { describe, expect, it } from "vitest";
import { TYPE_PROP } from "../constants.js";
import { isValue } from "./type-guards.js";
import { createValue, mergeValues, TYPE_VALUE, type Value } from "./value.js";
import { wrapValue } from "./wrap-value.js";

describe("isValue", () => {
  describe("valid observables", () => {
    it("should return true for values created with createValue", () => {
      expect(isValue(createValue(42))).toBe(true);
      expect(isValue(createValue("hello"))).toBe(true);
      expect(isValue(createValue(true))).toBe(true);
      expect(isValue(createValue({ foo: "bar" }))).toBe(true);
      expect(isValue(createValue([1, 2, 3]))).toBe(true);
      expect(isValue(createValue(null))).toBe(true);
      expect(isValue(createValue(undefined))).toBe(true);
    });

    it("should return true for derived values created with .as()", () => {
      const source = createValue(10);
      const derived = source.as((x) => x * 2);
      expect(isValue(derived)).toBe(true);
    });

    it("should return true for merged values created with mergeValues()", () => {
      const a = createValue(1);
      const b = createValue(2);
      const merged = mergeValues(() => a() + b());
      expect(isValue(merged)).toBe(true);
    });

    it("should return true for wrapped values created with wrapValue()", () => {
      const wrapped = wrapValue(100);
      expect(isValue(wrapped)).toBe(true);
    });

    it("should return true for custom functions that satisfy Value structure", () => {
      const customValue = (() => 42) as unknown as Value<number>;
      (customValue as any)[TYPE_PROP] = TYPE_VALUE;
      expect(isValue(customValue)).toBe(true);
    });
  });

  describe("invalid observables and non-functions", () => {
    it("should return false for primitive values", () => {
      expect(isValue(42)).toBe(false);
      expect(isValue("value")).toBe(false);
      expect(isValue(true)).toBe(false);
      expect(isValue(false)).toBe(false);
      expect(isValue(null)).toBe(false);
      expect(isValue(undefined)).toBe(false);
      expect(isValue(Symbol("test"))).toBe(false);
      expect(isValue(BigInt(123))).toBe(false);
    });

    it("should return false for plain functions without TYPE_PROP", () => {
      expect(isValue(() => {})).toBe(false);
      expect(isValue(function () {})).toBe(false);
      expect(isValue(async () => {})).toBe(false);
      expect(isValue(function* () {})).toBe(false);
      expect(isValue(class {})).toBe(false);
    });

    it("should return false for plain objects", () => {
      expect(isValue({})).toBe(false);
      expect(isValue({ id: "123", value: 42 })).toBe(false);
      expect(isValue({ [TYPE_PROP]: TYPE_VALUE })).toBe(false);
      expect(isValue(Object.create(null))).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isValue([])).toBe(false);
      expect(isValue([1, 2, 3])).toBe(false);
    });

    it("should return false for functions with incorrect TYPE_PROP value", () => {
      const fn = () => {};
      (fn as any)[TYPE_PROP] = "component";
      expect(isValue(fn)).toBe(false);

      (fn as any)[TYPE_PROP] = "element";
      expect(isValue(fn)).toBe(false);

      (fn as any)[TYPE_PROP] = null;
      expect(isValue(fn)).toBe(false);

      (fn as any)[TYPE_PROP] = undefined;
      expect(isValue(fn)).toBe(false);
    });

    it("should return false for standard built-in objects and instances", () => {
      expect(isValue(new Date())).toBe(false);
      expect(isValue(new RegExp("abc"))).toBe(false);
      expect(isValue(new Map())).toBe(false);
      expect(isValue(new Set())).toBe(false);
      expect(isValue(new Error("fail"))).toBe(false);
      expect(isValue(Promise.resolve(1))).toBe(false);
    });
  });

  describe("TypeScript type narrowing", () => {
    it("should narrow type to Value<T>", () => {
      const candidate: unknown = createValue(100);

      if (isValue<number>(candidate)) {
        const val: number = candidate();
        expect(val).toBe(100);

        const prev: number = candidate(200);
        expect(prev).toBe(100);
        expect(candidate()).toBe(200);
      } else {
        expect.unreachable("Candidate should have been identified as a Value");
      }
    });

    it("should not execute narrowed block for non-Value", () => {
      const candidate: unknown = "not-a-value";

      if (isValue(candidate)) {
        expect.unreachable("String should not be narrowed to Value");
      } else {
        expect(candidate).toBe("not-a-value");
      }
    });
  });
});
