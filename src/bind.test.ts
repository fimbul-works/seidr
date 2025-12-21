import { beforeEach, describe, expect, it, vi } from "vitest";
import { bind } from "./bind.js";
import { ObservableValue } from "./value.js";

describe("bind", () => {
  let element: HTMLElement;
  let observable: ObservableValue<string>;

  beforeEach(() => {
    element = document.createElement("div");
    observable = new ObservableValue("initial");
  });

  it("should call renderer immediately with current value", () => {
    const renderer = vi.fn();

    bind(observable, element, renderer);

    expect(renderer).toHaveBeenCalledWith("initial", element);
    expect(renderer).toHaveBeenCalledTimes(1);
  });

  it("should call renderer when observable value changes", () => {
    const renderer = vi.fn();

    bind(observable, element, renderer);

    expect(renderer).toHaveBeenCalledTimes(1);

    observable.value = "new value";

    expect(renderer).toHaveBeenCalledTimes(2);
    expect(renderer).toHaveBeenCalledWith("new value", element);
  });

  it("should return cleanup function", () => {
    const renderer = vi.fn();

    const cleanup = bind(observable, element, renderer);

    expect(typeof cleanup).toBe("function");

    // Call cleanup to verify it doesn't throw
    expect(() => cleanup()).not.toThrow();
  });

  it("should stop calling renderer after cleanup", () => {
    const renderer = vi.fn();

    const cleanup = bind(observable, element, renderer);

    // Initial call
    expect(renderer).toHaveBeenCalledTimes(1);

    cleanup();

    // Value change after cleanup should not trigger renderer
    observable.value = "new value";

    // Should still only have the initial call
    expect(renderer).toHaveBeenCalledTimes(1);
  });

  it("should work with different types", () => {
    const numberObs = new ObservableValue(42);
    const renderer = vi.fn();

    bind(numberObs, element, renderer);

    expect(renderer).toHaveBeenCalledWith(42, element);

    numberObs.value = 100;

    expect(renderer).toHaveBeenCalledWith(100, element);
  });
});
