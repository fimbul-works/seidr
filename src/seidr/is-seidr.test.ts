import { describe, expect, it } from "vitest";
import { isSeidr, Seidr } from "./index";

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
});
