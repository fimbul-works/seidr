import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce.js";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay function execution", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    debouncedFn("arg1", "arg2");

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should cancel previous calls when called multiple times", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("third");
  });

  it("should work with multiple rapid calls", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 50);

    // Call multiple times rapidly
    for (let i = 0; i < 5; i++) {
      debouncedFn(`call-${i}`);
    }

    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("call-4"); // Only the last call
  });

  it("should reset timer when called before delay expires", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    debouncedFn("first");

    vi.advanceTimersByTime(50);

    expect(callback).not.toHaveBeenCalled();

    debouncedFn("second");

    vi.advanceTimersByTime(50); // Total 100ms from first call, but only 50ms from second

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50); // Total 100ms from second call

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("should allow multiple separate debounced functions", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const debounced1 = debounce(callback1, 50);
    const debounced2 = debounce(callback2, 100);

    debounced1("func1");
    debounced2("func2");

    vi.advanceTimersByTime(50);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith("func1");
    expect(callback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50); // Total 100ms

    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith("func2");
  });

  it("should handle zero delay", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 0);

    debouncedFn("test");

    vi.advanceTimersByTime(0);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("test");
  });
});
