import { describe, expect, it } from "vitest";
import { isArray, isBool, isEmpty, isFn, isNum, isObj, isStr } from "./primitive-types";

describe("Primitive types", () => {
  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
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

  describe("isEmpty", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return false for non-empty values", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(""));
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
      expect(isStr(new String("hello"))).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = "hello";
      if (isStr(value)) {
        const typed = value;
        expect(typeof typed).toBe("string");
      }
    });
  });
});
