import {
  component,
  isArray,
  isBool,
  isComponent,
  isDOMNode,
  isEmpty,
  isFn,
  isHTMLElement,
  isNum,
  isObj,
  isSeidr,
  isStr,
  Seidr,
} from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { describe, expect, test } from "vitest";

describe("docs/TypeGuards.md Examples", () => {
  test("Primitive Type Guards", () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray({})).toBe(false);

    expect(isBool(true)).toBe(true);
    expect(isBool(false)).toBe(true);
    expect(isBool(1)).toBe(false);

    const fn = () => {};
    const asyncFn = async () => {};
    expect(isFn(fn)).toBe(true);
    expect(isFn(asyncFn)).toBe(true);
    expect(isFn(class {})).toBe(true);
    expect(isFn({})).toBe(false);

    expect(isNum(42)).toBe(true);
    expect(isNum(NaN)).toBe(true);
    expect(isNum("42")).toBe(false);

    expect(isObj({})).toBe(true);
    expect(isObj([])).toBe(false);
    expect(isObj(null)).toBe(false);

    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty("defined")).toBe(false);

    expect(isStr("hello")).toBe(true);
    expect(isStr(123)).toBe(false);
  });

  test("Seidr Type Guards", () => {
    const count = new Seidr(0);
    const derived = count.as((n) => n * 2);
    const plainObj = { value: 0 };

    expect(isSeidr(count)).toBe(true);
    expect(isSeidr(derived)).toBe(true);
    expect(isSeidr(plainObj)).toBe(false);
  });

  test("DOM Type Guards", () => {
    const el = document.createElement("div");
    const plainObj = { value: 0 };

    expect(isDOMNode(el)).toBe(true);
    expect(isDOMNode(plainObj)).toBe(false);

    const seidrEl = $div();
    expect(isHTMLElement(el)).toBe(true);
    expect(isHTMLElement(seidrEl)).toBe(true);
  });

  test("Component Type Guards", () => {
    const factory = component(() => $div());
    const comp = factory();
    const plainObj = { value: 0 };

    expect(isComponent(comp)).toBe(true);
    expect(isComponent(plainObj)).toBe(false);
  });
});
