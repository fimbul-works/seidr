import { describe, expect, it, vi } from "vitest";
import { safe } from "./safe";

describe("safe", () => {
  it("should execute function and return value", () => {
    expect(safe(() => 1 + 1)).toBe(2);
  });

  it("should catch errors and call onErrorFn", () => {
    const errorArr = new Error("fail");
    const onError = vi.fn(() => "fallback");
    const result = safe(() => {
      throw errorArr;
    }, onError);
    expect(result).toBe("fallback");
    // safe wraps errors, so we check if the message matches
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe("fail");
  });

  it("should execute finallyFn", () => {
    const finallyFn = vi.fn();
    safe(() => 1, null, finallyFn);
    expect(finallyFn).toHaveBeenCalled();
  });

  it("should execute finallyFn even on error", () => {
    const finallyFn = vi.fn();
    safe(
      () => {
        throw new Error();
      },
      () => {},
      finallyFn,
    );
    expect(finallyFn).toHaveBeenCalled();
  });
});
