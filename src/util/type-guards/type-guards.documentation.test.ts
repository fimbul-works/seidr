import { describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import {
  isArray,
  isBool,
  isComment,
  isDOMNode,
  isEmpty,
  isFn,
  isHTMLElement,
  isNum,
  isObj,
  isSeidr,
  isSeidrComponent,
  isSeidrComponentFactory,
  isSeidrElement,
  isStr,
  isTextNode,
  isUndefined,
} from ".";

describe("Type Guard Utilities Documentation Examples", () => {
  describe("isBool", () => {
    it("should demonstrate boolean checking", () => {
      expect(isBool(true)).toBe(true);
      expect(isBool(false)).toBe(true);
      expect(isBool(1)).toBe(false);
      expect(isBool("true")).toBe(false);
    });
  });

  describe("isFn", () => {
    it("should demonstrate function checking", () => {
      const fn = () => {};
      const asyncFn = async () => {};

      expect(isFn(fn)).toBe(true);
      expect(isFn(asyncFn)).toBe(true);
      expect(isFn({})).toBe(false);
      expect(isFn(null)).toBe(false);
    });
  });

  describe("isNum", () => {
    it("should demonstrate number checking", () => {
      expect(isNum(42)).toBe(true);
      expect(isNum(-3.14)).toBe(true);
      expect(isNum(Infinity)).toBe(true);
      expect(isNum("42")).toBe(false);
      expect(isNum(NaN)).toBe(true); // NaN is technically a number type
    });
  });

  describe("isObj", () => {
    it("should demonstrate object checking", () => {
      expect(isObj({})).toBe(true);
      expect(isObj({ a: 1, b: 2 })).toBe(true);
      expect(isObj([])).toBe(false);
      expect(isObj(null)).toBe(false);
    });
  });

  describe("isSeidr", () => {
    it("should demonstrate Seidr instance checking", () => {
      const count = new Seidr(0);
      const text = new Seidr("hello");

      expect(isSeidr(count)).toBe(true);
      expect(isSeidr(text)).toBe(true);
      expect(isSeidr(42)).toBe(false);
      expect(isSeidr({ value: 0 })).toBe(false);
    });
  });

  describe("isStr", () => {
    it("should demonstrate string checking", () => {
      expect(isStr("hello")).toBe(true);
      expect(isStr("")).toBe(true);
      expect(isStr("123")).toBe(true);
      expect(isStr(123)).toBe(false);
    });
  });

  describe("isUndefined", () => {
    it("should demonstrate undefined checking", () => {
      let maybeUndefined: string | undefined;

      maybeUndefined = undefined;
      expect(isUndefined(maybeUndefined)).toBe(true);

      maybeUndefined = "defined";
      expect(isUndefined(maybeUndefined)).toBe(false);
    });
  });
});
