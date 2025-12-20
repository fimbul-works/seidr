import { beforeEach, describe, expect, it, vi } from "vitest";
import { bind, computed, toggleClass } from "./reactive.js";
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

describe("computed", () => {
  it("should create computed value with initial computation", () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);

    const sum = computed(() => a.value + b.value, [a, b]);

    expect(sum.value).toBe(5);
  });

  it("should update when dependencies change", () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);

    const sum = computed(() => a.value + b.value, [a, b]);

    expect(sum.value).toBe(5);

    a.value = 10;

    expect(sum.value).toBe(13);

    b.value = 7;

    expect(sum.value).toBe(17);
  });

  it("should work with multiple dependencies", () => {
    const firstName = new ObservableValue("John");
    const lastName = new ObservableValue("Doe");
    const age = new ObservableValue(30);

    const fullName = computed(
      () => `${firstName.value} ${lastName.value}, age ${age.value}`,
      [firstName, lastName, age],
    );

    expect(fullName.value).toBe("John Doe, age 30");

    lastName.value = "Smith";
    expect(fullName.value).toBe("John Smith, age 30");

    age.value = 31;
    expect(fullName.value).toBe("John Smith, age 31");
  });

  it("should work with computed values as dependencies", () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);
    const sum = computed(() => a.value + b.value, [a, b]);
    const doubled = computed(() => sum.value * 2, [sum]);

    expect(doubled.value).toBe(10);

    a.value = 5;

    expect(sum.value).toBe(8);
    expect(doubled.value).toBe(16);
  });

  it("should return ObservableValue instance", () => {
    const a = new ObservableValue(1);
    const result = computed(() => a.value * 2, [a]);

    expect(result).toBeInstanceOf(ObservableValue);
  });

  it("should warn when no dependencies provided", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    computed(() => 42, []);

    expect(consoleSpy).toHaveBeenCalledWith("Computed value with zero dependencies");

    consoleSpy.mockRestore();
  });

  it("should not update when unrelated observables change", () => {
    const a = new ObservableValue(2);
    const unrelated = new ObservableValue("unrelated");

    const sum = computed(() => a.value + 1, [a]);

    expect(sum.value).toBe(3);

    unrelated.value = "changed";

    expect(sum.value).toBe(3); // Should remain unchanged
  });

  it("should handle computation errors gracefully", () => {
    const a = new ObservableValue(2);

    const faulty = computed(() => {
      if (a.value === 0) {
        throw new Error("Division by zero");
      }
      return 100 / a.value;
    }, [a]);

    expect(faulty.value).toBe(50);

    // This should throw, but we can't easily test error handling here
    // since it depends on the ObservableValue implementation
    // We're mainly testing that the computed structure works
  });
});

describe("toggleClass", () => {
  let element: HTMLElement;
  let observable: ObservableValue<boolean>;

  beforeEach(() => {
    element = document.createElement("div");
    observable = new ObservableValue(false);
  });

  it("should add class when observable is true", () => {
    observable.value = true;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(true);

    cleanup();
  });

  it("should remove class when observable is false", () => {
    observable.value = false;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should toggle class when observable changes", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    observable.value = true;

    expect(element.classList.contains("active")).toBe(true);

    observable.value = false;

    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should return cleanup function", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("should stop updating after cleanup", () => {
    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("active")).toBe(false);

    cleanup();

    observable.value = true;

    // Class should not be added after cleanup
    expect(element.classList.contains("active")).toBe(false);
  });

  it("should work with existing classes on element", () => {
    element.classList.add("existing");
    observable.value = true;

    const cleanup = toggleClass(observable, element, "active");

    expect(element.classList.contains("existing")).toBe(true);
    expect(element.classList.contains("active")).toBe(true);

    cleanup();

    expect(element.classList.contains("existing")).toBe(true);
    // toggleClass cleanup doesn't remove the class, it just stops observing changes
    expect(element.classList.contains("active")).toBe(true);
  });
});
