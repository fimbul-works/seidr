import { describe, expect, it } from "vitest";
import { Seidr } from "../seidr";
import { isBool, isFn, isNum, isObj, isSeidr, isStr, isUndefined } from "./is";

describe("is.ts - Type Guard Utilities", () => {
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

    describe("Documentation Examples", () => {
      it("should demonstrate undefined checking", () => {
        let maybeUndefined: string | undefined;

        maybeUndefined = undefined;
        expect(isUndefined(maybeUndefined)).toBe(true);

        maybeUndefined = "defined";
        expect(isUndefined(maybeUndefined)).toBe(false);
      });
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

    describe("Documentation Examples", () => {
      it("should demonstrate boolean checking", () => {
        expect(isBool(true)).toBe(true);
        expect(isBool(false)).toBe(true);
        expect(isBool(1)).toBe(false);
        expect(isBool("true")).toBe(false);
      });
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

    describe("Documentation Examples", () => {
      it("should demonstrate number checking", () => {
        expect(isNum(42)).toBe(true);
        expect(isNum(-3.14)).toBe(true);
        expect(isNum(Infinity)).toBe(true);
        expect(isNum("42")).toBe(false);
        expect(isNum(NaN)).toBe(true); // NaN is technically a number type
      });
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

    describe("Documentation Examples", () => {
      it("should demonstrate string checking", () => {
        expect(isStr("hello")).toBe(true);
        expect(isStr("")).toBe(true);
        expect(isStr("123")).toBe(true);
        expect(isStr(123)).toBe(false);
      });
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

    describe("Documentation Examples", () => {
      it("should demonstrate function checking", () => {
        const fn = () => {};
        const asyncFn = async () => {};

        expect(isFn(fn)).toBe(true);
        expect(isFn(asyncFn)).toBe(true);
        expect(isFn({})).toBe(false);
        expect(isFn(null)).toBe(false);
      });
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

    describe("Documentation Examples", () => {
      it("should demonstrate object checking", () => {
        expect(isObj({})).toBe(true);
        expect(isObj({ a: 1, b: 2 })).toBe(true);
        expect(isObj([])).toBe(false);
        expect(isObj(null)).toBe(false);
      });
    });
  });

  describe("isSeidr", () => {
    it("should return true for Seidr instances", () => {
      expect(isSeidr(new Seidr(42))).toBe(true);
      expect(isSeidr(new Seidr("hello"))).toBe(true);
      expect(isSeidr(new Seidr({ a: 1 }))).toBe(true);
    });

    it("should return false for non-Seidr values", () => {
      expect(isSeidr(42)).toBe(false);
      expect(isSeidr("hello")).toBe(false);
      expect(isSeidr({ a: 1 })).toBe(false);
      expect(isSeidr(null)).toBe(false);
      expect(isSeidr(undefined)).toBe(false);
    });

    it("should return false for plain objects", () => {
      const fakeSeidr = { value: 42, bind: () => {} };
      expect(isSeidr(fakeSeidr)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = new Seidr(42);
      if (isSeidr(value)) {
        const typed = value;
        expect(typed.value).toBe(42);
      }
    });

    it("should work with derived Seidr instances", () => {
      const base = new Seidr(5);
      const derived = base.as((n) => n * 2);

      expect(isSeidr(base)).toBe(true);
      expect(isSeidr(derived)).toBe(true);
    });

    it("should work with computed Seidr instances", () => {
      const a = new Seidr(1);
      const b = new Seidr(2);
      const sum = Seidr.computed(() => a.value + b.value, [a, b]);

      expect(isSeidr(a)).toBe(true);
      expect(isSeidr(b)).toBe(true);
      expect(isSeidr(sum)).toBe(true);
    });

    describe("Documentation Examples", () => {
      it("should demonstrate Seidr instance checking", () => {
        const count = new Seidr(0);
        const text = new Seidr("hello");

        expect(isSeidr(count)).toBe(true);
        expect(isSeidr(text)).toBe(true);
        expect(isSeidr(42)).toBe(false);
        expect(isSeidr({ value: 0 })).toBe(false);
      });
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
      const seidr = new Seidr(0);

      // undefined
      expect(isUndefined(undef)).toBe(true);
      expect(isBool(undef)).toBe(false);
      expect(isNum(undef)).toBe(false);
      expect(isStr(undef)).toBe(false);
      expect(isFn(undef)).toBe(false);
      expect(isObj(undef)).toBe(false);
      expect(isSeidr(undef)).toBe(false);

      // null
      expect(isUndefined(nul)).toBe(false);
      expect(isBool(nul)).toBe(false);
      expect(isNum(nul)).toBe(false);
      expect(isStr(nul)).toBe(false);
      expect(isFn(nul)).toBe(false);
      expect(isObj(nul)).toBe(false);
      expect(isSeidr(nul)).toBe(false);

      // boolean
      expect(isUndefined(bool)).toBe(false);
      expect(isBool(bool)).toBe(true);
      expect(isNum(bool)).toBe(false);
      expect(isStr(bool)).toBe(false);
      expect(isFn(bool)).toBe(false);
      expect(isObj(bool)).toBe(false);
      expect(isSeidr(bool)).toBe(false);

      // number
      expect(isUndefined(num)).toBe(false);
      expect(isBool(num)).toBe(false);
      expect(isNum(num)).toBe(true);
      expect(isStr(num)).toBe(false);
      expect(isFn(num)).toBe(false);
      expect(isObj(num)).toBe(false);
      expect(isSeidr(num)).toBe(false);

      // string
      expect(isUndefined(str)).toBe(false);
      expect(isBool(str)).toBe(false);
      expect(isNum(str)).toBe(false);
      expect(isStr(str)).toBe(true);
      expect(isFn(str)).toBe(false);
      expect(isObj(str)).toBe(false);
      expect(isSeidr(str)).toBe(false);

      // function
      expect(isUndefined(fn)).toBe(false);
      expect(isBool(fn)).toBe(false);
      expect(isNum(fn)).toBe(false);
      expect(isStr(fn)).toBe(false);
      expect(isFn(fn)).toBe(true);
      expect(isObj(fn)).toBe(false);
      expect(isSeidr(fn)).toBe(false);

      // object
      expect(isUndefined(obj)).toBe(false);
      expect(isBool(obj)).toBe(false);
      expect(isNum(obj)).toBe(false);
      expect(isStr(obj)).toBe(false);
      expect(isFn(obj)).toBe(false);
      expect(isObj(obj)).toBe(true);
      expect(isSeidr(obj)).toBe(false);

      // Seidr
      expect(isUndefined(seidr)).toBe(false);
      expect(isBool(seidr)).toBe(false);
      expect(isNum(seidr)).toBe(false);
      expect(isStr(seidr)).toBe(false);
      expect(isFn(seidr)).toBe(false);
      expect(isObj(seidr)).toBe(true);
      expect(isSeidr(seidr)).toBe(true);
    });
  });
});
