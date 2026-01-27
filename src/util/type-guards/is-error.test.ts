import { describe, expect, it } from "vitest";
import { isError } from "./is-error";

describe("isError", () => {
  it("should return true for Error class instances", () => {
    expect(isError(new Error("test"))).toBe(true);
    expect(isError(Error.call("test"))).toBe(true);
  });

  it("should return false for plain objects", () => {
    expect(isError({})).toBe(false);
    expect(isError({ a: 1 })).toBe(false);
  });

  it("should return false for null", () => {
    expect(isError(null)).toBe(false);
  });

  it("should return false for primitives", () => {
    expect(isError(42)).toBe(false);
    expect(isError("string")).toBe(false);
    expect(isError(true)).toBe(false);
  });

  it("should return true for custom classes", () => {
    class TestError extends Error {}
    const error = new TestError();
    expect(isError(error)).toBe(true);
    expect(error).toBeInstanceOf(TestError);
    expect(error).toBeInstanceOf(Error);
  });

  it("should narrow type correctly", () => {
    class TestError extends Error {}
    const error = new TestError();
    if (isError(error)) {
      const typed = error;
      expect(typed).toBeInstanceOf(Error);
    }
  });
});
