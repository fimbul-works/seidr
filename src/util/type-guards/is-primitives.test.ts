import { describe, expect, it } from "vitest";
import { isBool, isEmpty, isFn, isNum, isObj, isStr, isUndefined } from "./is-primitives";

describe("Type Guard Utilities - Primitives", () => {
  describe("isEmpty", () => {
    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return false for defined values", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty("")).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const undef = undefined;
      if (isEmpty(undef)) {
        // Type should be narrowed to undefined
        const typedUndef = undef;
        expect(typedUndef).toBeUndefined();
      }

      const nullable = null;
      if (isEmpty(nullable)) {
        // Type should be narrowed to undefined
        const typedNullable = nullable;
        expect(typedNullable).toBeNull();
      }
    });
  });

  describe("isUndefined", () => {
    it("should return true for undefined", () => {
      expect(isUndefined(undefined)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isUndefined(null)).toBe(false);
    });

    it("should return false for defined values", () => {
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined("")).toBe(false);
      expect(isUndefined(false)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = undefined;
      if (isUndefined(value)) {
        // Type should be narrowed to undefined
        const typed: undefined = value;
        expect(typed).toBeUndefined();
      }
    });
  });

  describe("isBool", () => {
    it("should return true for boolean primitives", () => {
      expect(isBool(true)).toBe(true);
      expect(isBool(false)).toBe(true);
    });

    it("should return false for non-booleans", () => {
      expect(isBool(1)).toBe(false);
      expect(isBool("true")).toBe(false);
      expect(isBool(null)).toBe(false);
      expect(isBool(undefined)).toBe(false);
    });

    it("should return false for Boolean objects", () => {
      expect(isBool(new Boolean(true))).toBe(false); // eslint-disable-line no-new-wrappers
    });

    it("should narrow type correctly", () => {
      const value: unknown = true;
      if (isBool(value)) {
        const typed = value;
        expect(typeof typed).toBe("boolean");
      }
    });
  });

  describe("isNum", () => {
    it("should return true for numbers", () => {
      expect(isNum(0)).toBe(true);
      expect(isNum(42)).toBe(true);
      expect(isNum(-3.14)).toBe(true);
      expect(isNum(Infinity)).toBe(true);
      expect(isNum(NaN)).toBe(true);
    });

    it("should return false for non-numbers", () => {
      expect(isNum("42")).toBe(false);
      expect(isNum(true)).toBe(false);
      expect(isNum(null)).toBe(false);
      expect(isNum(undefined)).toBe(false);
    });

    it("should return false for Number objects", () => {
      expect(isNum(new Number(42))).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = 42;
      if (isNum(value)) {
        const typed = value;
        expect(typeof typed).toBe("number");
      }
    });
  });

  describe("isStr", () => {
    it("should return true for strings", () => {
      expect(isStr("")).toBe(true);
      expect(isStr("hello")).toBe(true);
      expect(isStr("123")).toBe(true);
    });

    it("should return false for non-strings", () => {
      expect(isStr(123)).toBe(false);
      expect(isStr(true)).toBe(false);
      expect(isStr(null)).toBe(false);
      expect(isStr(undefined)).toBe(false);
    });

    it("should return false for String objects", () => {
      expect(isStr(new String("hello"))).toBe(false); // eslint-disable-line no-new-wrappers
    });

    it("should narrow type correctly", () => {
      const value: unknown = "hello";
      if (isStr(value)) {
        const typed = value;
        expect(typeof typed).toBe("string");
      }
    });
  });

  describe("isFn", () => {
    it("should return true for functions", () => {
      expect(isFn(() => {})).toBe(true);
      expect(isFn(() => {})).toBe(true);
      expect(isFn(async () => {})).toBe(true);
      expect(isFn(function* () {})).toBe(true); // Generator functions
    });

    it("should return true for class constructors", () => {
      expect(isFn(class {})).toBe(true);
      expect(isFn(Array)).toBe(true);
      expect(isFn(Object)).toBe(true);
    });

    it("should return false for non-functions", () => {
      expect(isFn({})).toBe(false);
      expect(isFn(null)).toBe(false);
      expect(isFn(undefined)).toBe(false);
      expect(isFn(42)).toBe(false);
    });

    it("should return false for async function generators", () => {
      expect(isFn(async function* () {})).toBe(true);
    });

    it("should narrow type correctly", () => {
      const value: unknown = () => {};
      if (isFn(value)) {
        const typed = value;
        expect(typeof typed).toBe("function");
      }
    });
  });

  describe("isObj", () => {
    it("should return true for plain objects", () => {
      expect(isObj({})).toBe(true);
      expect(isObj({ a: 1 })).toBe(true);
      expect(isObj(Object.create(null))).toBe(true);
    });

    it("should return false for arrays", () => {
      expect(isObj([])).toBe(false);
      expect(isObj([1, 2, 3])).toBe(false);
    });

    it("should return false for null", () => {
      expect(isObj(null)).toBe(false);
    });

    it("should return false for primitives", () => {
      expect(isObj(42)).toBe(false);
      expect(isObj("string")).toBe(false);
      expect(isObj(true)).toBe(false);
    });

    it("should return true for class instances", () => {
      class TestClass {
        a = 1;
      }
      expect(isObj(new TestClass())).toBe(true);
    });

    it("should narrow type correctly", () => {
      const value: unknown = { a: 1 };
      if (isObj(value)) {
        const typed = value;
        expect(typeof typed).toBe("object");
      }
    });
  });

  describe("Integration Tests", () => {
    it("should distinguish between different types correctly", () => {
      // Test each value individually
      const undef = undefined;
      const nul = null;
      const bool = true;
      const num = 42;
      const str = "hello";
      const fn = () => {};
      const obj = {};

      // undefined
      expect(isEmpty(undef)).toBe(true);
      expect(isUndefined(undef)).toBe(true);
      expect(isBool(undef)).toBe(false);
      expect(isNum(undef)).toBe(false);
      expect(isStr(undef)).toBe(false);
      expect(isFn(undef)).toBe(false);
      expect(isObj(undef)).toBe(false);

      // null
      expect(isEmpty(nul)).toBe(true);
      expect(isUndefined(nul)).toBe(false);
      expect(isBool(nul)).toBe(false);
      expect(isNum(nul)).toBe(false);
      expect(isStr(nul)).toBe(false);
      expect(isFn(nul)).toBe(false);
      expect(isObj(nul)).toBe(false);

      // boolean
      expect(isEmpty(bool)).toBe(false);
      expect(isUndefined(bool)).toBe(false);
      expect(isBool(bool)).toBe(true);
      expect(isNum(bool)).toBe(false);
      expect(isStr(bool)).toBe(false);
      expect(isFn(bool)).toBe(false);
      expect(isObj(bool)).toBe(false);

      // number
      expect(isEmpty(num)).toBe(false);
      expect(isUndefined(num)).toBe(false);
      expect(isBool(num)).toBe(false);
      expect(isNum(num)).toBe(true);
      expect(isStr(num)).toBe(false);
      expect(isFn(num)).toBe(false);
      expect(isObj(num)).toBe(false);

      // string
      expect(isEmpty(str)).toBe(false);
      expect(isUndefined(str)).toBe(false);
      expect(isBool(str)).toBe(false);
      expect(isNum(str)).toBe(false);
      expect(isStr(str)).toBe(true);
      expect(isFn(str)).toBe(false);
      expect(isObj(str)).toBe(false);

      // function
      expect(isEmpty(fn)).toBe(false);
      expect(isUndefined(fn)).toBe(false);
      expect(isBool(fn)).toBe(false);
      expect(isNum(fn)).toBe(false);
      expect(isStr(fn)).toBe(false);
      expect(isFn(fn)).toBe(true);
      expect(isObj(fn)).toBe(false);

      // object
      expect(isEmpty(obj)).toBe(false);
      expect(isUndefined(obj)).toBe(false);
      expect(isBool(obj)).toBe(false);
      expect(isNum(obj)).toBe(false);
      expect(isStr(obj)).toBe(false);
      expect(isFn(obj)).toBe(false);
      expect(isObj(obj)).toBe(true);
    });
  });
});
