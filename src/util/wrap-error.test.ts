import { describe, expect, it } from "vitest";
import { wrapError } from "./wrap-error";

describe("wrapError", () => {
  it("should return the same error if it is an instance of Error and using default constructor", () => {
    const err = new Error("test");
    const result = wrapError(err);
    expect(result).toBe(err);
  });

  it("should wrap a string in an Error instance", () => {
    const result = wrapError("something went wrong");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("something went wrong");
    expect(result.cause).toBe("something went wrong");
  });

  it("should wrap an object in an Error instance", () => {
    const data = { foo: "bar" };
    const result = wrapError(data);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[object Object]");
    expect(result.cause).toBe(data);
  });

  it("should wrap an Error in a custom Error class", () => {
    class CustomError extends Error {}
    const originalErr = new Error("original");
    const result = wrapError(originalErr, CustomError);

    expect(result).toBeInstanceOf(CustomError);
    expect(result.message).toBe("original");
    expect(result.cause).toBe(originalErr);
  });

  it("should return the same instance if it is already an instance of the custom Error class", () => {
    class CustomError extends Error {}
    const customErr = new CustomError("custom");
    const result = wrapError(customErr, CustomError);

    expect(result).toBe(customErr);
  });

  it("should wrap a value in a custom Error class with cause", () => {
    class AppError extends Error {
      constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "AppError";
      }
    }

    const result = wrapError("fail", AppError);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("fail");
    expect(result.cause).toBe("fail");
  });

  it("should use any if not provided constructor", () => {
    const result = wrapError(123);
    expect(result.message).toBe("123");
    expect(result.cause).toBe(123);
  });
});
