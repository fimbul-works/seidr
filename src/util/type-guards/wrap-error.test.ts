import { describe, expect, it } from "vitest";
import { wrapError } from "./wrap-error";

describe("wrapError", () => {
  class TestError extends Error {}

  it("should wrap the value in an Error", () => {
    const error = wrapError("Test");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test");
  });

  it("should not wrap an Error in another Error", () => {
    const error = wrapError(new Error("Test"));
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test");
  });

  it("should wrap the value in a custom TestError class", () => {
    const error = wrapError(new TestError("Test"));
    expect(error).toBeInstanceOf(TestError);
    expect(error.message).toBe("Test");
  });

  it("should not wrap an existing Error in a custom TestError class", () => {
    const error = wrapError(new Error("Test"), TestError);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TestError);
    expect(error.message).toBe("Test");
  });
});
