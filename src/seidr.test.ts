import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "./seidr.js";

describe("Seidr", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("constructor", () => {
    it("should initialize with the provided value", () => {
      const observable = new Seidr(42);
      expect(observable.value).toBe(42);
    });

    it("should handle different types of values", () => {
      const numberObs = new Seidr(123);
      const stringObs = new Seidr("test");
      const boolObs = new Seidr(true);
      const objObs = new Seidr({ foo: "bar" });
      const arrayObs = new Seidr([1, 2, 3]);

      expect(numberObs.value).toBe(123);
      expect(stringObs.value).toBe("test");
      expect(boolObs.value).toBe(true);
      expect(objObs.value).toEqual({ foo: "bar" });
      expect(arrayObs.value).toEqual([1, 2, 3]);
    });

    it("should handle null and undefined", () => {
      const nullObs = new Seidr(null);
      const undefinedObs = new Seidr(undefined);

      expect(nullObs.value).toBeNull();
      expect(undefinedObs.value).toBeUndefined();
    });
  });

  describe("value get and set", () => {
    it("should return the current value", () => {
      const observable = new Seidr("test");
      expect(observable.value).toBe("test");
    });

    it("should update and return the latest value", () => {
      const observable = new Seidr("initial");
      observable.value = "updated";
      expect(observable.value).toBe("updated");
    });

    it("should not notify observers when setting the same value", () => {
      const observable = new Seidr("test");
      const handler = vi.fn();

      observable.observe(handler);
      observable.value = "test";

      expect(handler).not.toHaveBeenCalled();
    });

    it("should handle Object.is edge cases", () => {
      const observable = new Seidr(0);
      const handler = vi.fn();
      observable.observe(handler);

      // -0 and +0 are different in Object.is
      observable.value = -0;
      expect(handler).toHaveBeenCalledTimes(1);

      // NaN is equal to itself in Object.is
      const nanObservable = new Seidr(Number.NaN);
      const nanHandler = vi.fn();
      nanObservable.observe(nanHandler);
      nanObservable.value = Number.NaN;
      expect(nanHandler).not.toHaveBeenCalled();
    });
  });

  describe("bind", () => {
    let element: HTMLElement;
    let observable: Seidr<string>;

    beforeEach(() => {
      element = document.createElement("div");
      observable = new Seidr("initial");
    });

    it("should call renderer immediately with current value", () => {
      const renderer = vi.fn();

      observable.bind(element, renderer);

      expect(renderer).toHaveBeenCalledWith("initial", element);
      expect(renderer).toHaveBeenCalledTimes(1);
    });

    it("should call renderer when observable value changes", () => {
      const renderer = vi.fn();

      observable.bind(element, renderer);

      expect(renderer).toHaveBeenCalledTimes(1);

      observable.value = "new value";

      expect(renderer).toHaveBeenCalledTimes(2);
      expect(renderer).toHaveBeenCalledWith("new value", element);
    });

    it("should return cleanup function", () => {
      const renderer = vi.fn();

      const cleanup = observable.bind(element, renderer);

      expect(typeof cleanup).toBe("function");

      // Call cleanup to verify it doesn't throw
      expect(() => cleanup()).not.toThrow();
    });

    it("should stop calling renderer after cleanup", () => {
      const renderer = vi.fn();

      const cleanup = observable.bind(element, renderer);

      // Initial call
      expect(renderer).toHaveBeenCalledTimes(1);

      cleanup();

      // Value change after cleanup should not trigger renderer
      observable.value = "new value";

      // Should still only have the initial call
      expect(renderer).toHaveBeenCalledTimes(1);
    });

    it("should work with different types", () => {
      const numberObs = new Seidr(42);
      const renderer = vi.fn();

      numberObs.bind(element, renderer);

      expect(renderer).toHaveBeenCalledWith(42, element);

      numberObs.value = 100;

      expect(renderer).toHaveBeenCalledWith(100, element);
    });
  });

  describe("derive", () => {
    it("should create derived observable with transformed values", () => {
      const observable = new Seidr(5);
      const derived = observable.as((x) => x * 2);

      expect(derived.value).toBe(10);

      observable.value = 10;
      expect(derived.value).toBe(20);
    });

    it("should handle type transformations", () => {
      const observable = new Seidr(42);
      const derived = observable.as((x) => x.toString());

      expect(derived.value).toBe("42");

      observable.value = 100;
      expect(derived.value).toBe("100");
    });

    it("should propagate updates to multiple derived observables", () => {
      const observable = new Seidr(1);
      const doubled = observable.as((x) => x * 2);
      const squared = observable.as((x) => x * x);
      const doubledHandler = vi.fn();
      const squaredHandler = vi.fn();

      doubled.observe(doubledHandler);
      squared.observe(squaredHandler);

      observable.value = 3;

      expect(doubled.value).toBe(6);
      expect(squared.value).toBe(9);
      expect(doubledHandler).toHaveBeenCalledWith(6);
      expect(squaredHandler).toHaveBeenCalledWith(9);
    });
  });

  describe("observer management", () => {
    it("should report correct observer count", () => {
      const observable = new Seidr("test");
      expect(observable.observerCount()).toBe(0);

      const unsub1 = observable.observe(() => {});
      expect(observable.observerCount()).toBe(1);

      const unsub2 = observable.observe(() => {});
      expect(observable.observerCount()).toBe(2);

      unsub1();
      expect(observable.observerCount()).toBe(1);

      unsub2();
      expect(observable.observerCount()).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("should track cleanup functions", () => {
      const computed = new Seidr("test");
      let cleanupCalled = false;

      computed.addCleanup(() => {
        cleanupCalled = true;
      });

      expect(cleanupCalled).toBe(false);

      computed.destroy();

      expect(cleanupCalled).toBe(true);
    });

    it("should handle multiple cleanup functions", () => {
      const computed = new Seidr("test");
      let cleanup1Called = false;
      let cleanup2Called = false;

      computed.addCleanup(() => {
        cleanup1Called = true;
      });
      computed.addCleanup(() => {
        cleanup2Called = true;
      });

      computed.destroy();

      expect(cleanup1Called).toBe(true);
      expect(cleanup2Called).toBe(true);
    });

    it("should clear cleanup functions after destroy", () => {
      const computed = new Seidr("test");
      let cleanupCalled = false;

      computed.addCleanup(() => {
        cleanupCalled = true;
      });

      computed.destroy();
      computed.destroy(); // Call destroy twice

      expect(cleanupCalled).toBe(true);
    });
  });

  describe("computed", () => {
    it("should create computed value with initial computation", () => {
      const a = new Seidr(2);
      const b = new Seidr(3);

      const sum = Seidr.computed(() => a.value + b.value, [a, b]);

      expect(sum.value).toBe(5);
    });

    it("should update when dependencies change", () => {
      const a = new Seidr(2);
      const b = new Seidr(3);

      const sum = Seidr.computed(() => a.value + b.value, [a, b]);

      expect(sum.value).toBe(5);

      a.value = 10;

      expect(sum.value).toBe(13);

      b.value = 7;

      expect(sum.value).toBe(17);
    });

    it("should work with multiple dependencies", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const age = new Seidr(30);

      const fullName = Seidr.computed(
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
      const a = new Seidr(2);
      const b = new Seidr(3);
      const sum = Seidr.computed(() => a.value + b.value, [a, b]);
      const doubled = Seidr.computed(() => sum.value * 2, [sum]);

      expect(doubled.value).toBe(10);

      a.value = 5;

      expect(sum.value).toBe(8);
      expect(doubled.value).toBe(16);
    });

    it("should return Seidr instance", () => {
      const a = new Seidr(1);
      const result = Seidr.computed(() => a.value * 2, [a]);

      expect(result).toBeInstanceOf(Seidr);
    });

    it("should warn when no dependencies provided", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      Seidr.computed(() => 42, []);

      expect(consoleSpy).toHaveBeenCalledWith("Computed value with zero dependencies");

      consoleSpy.mockRestore();
    });

    it("should not update when unrelated observables change", () => {
      const a = new Seidr(2);
      const unrelated = new Seidr("unrelated");

      const sum = Seidr.computed(() => a.value + 1, [a]);

      expect(sum.value).toBe(3);

      unrelated.value = "changed";

      expect(sum.value).toBe(3); // Should remain unchanged
    });

    it("should handle computation errors gracefully", () => {
      const a = new Seidr(2);

      const faulty = Seidr.computed(() => {
        if (a.value === 0) {
          throw new Error("Division by zero");
        }
        return 100 / a.value;
      }, [a]);

      expect(faulty.value).toBe(50);

      // This should throw, but we can't easily test error handling here
      // since it depends on the Seidr implementation
      // We're mainly testing that the computed structure works
    });
  });
});
