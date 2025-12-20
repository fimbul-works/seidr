import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObservableValue } from "./value.js";

describe("ObservableValue", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("constructor", () => {
    it("should initialize with the provided value", () => {
      const observable = new ObservableValue(42);
      expect(observable.value).toBe(42);
    });

    it("should handle different types of values", () => {
      const numberObs = new ObservableValue(123);
      const stringObs = new ObservableValue("test");
      const boolObs = new ObservableValue(true);
      const objObs = new ObservableValue({ foo: "bar" });
      const arrayObs = new ObservableValue([1, 2, 3]);

      expect(numberObs.value).toBe(123);
      expect(stringObs.value).toBe("test");
      expect(boolObs.value).toBe(true);
      expect(objObs.value).toEqual({ foo: "bar" });
      expect(arrayObs.value).toEqual([1, 2, 3]);
    });

    it("should handle null and undefined", () => {
      const nullObs = new ObservableValue(null);
      const undefinedObs = new ObservableValue(undefined);

      expect(nullObs.value).toBeNull();
      expect(undefinedObs.value).toBeUndefined();
    });
  });

  describe("value get and set", () => {
    it("should return the current value", () => {
      const observable = new ObservableValue("test");
      expect(observable.value).toBe("test");
    });

    it("should update and return the latest value", () => {
      const observable = new ObservableValue("initial");
      observable.value = "updated";
      expect(observable.value).toBe("updated");
    });

    it("should not notify observers when setting the same value", () => {
      const observable = new ObservableValue("test");
      const handler = vi.fn();

      observable.observe(handler);
      observable.value = "test";

      expect(handler).not.toHaveBeenCalled();
    });

    it("should handle Object.is edge cases", () => {
      const observable = new ObservableValue(0);
      const handler = vi.fn();
      observable.observe(handler);

      // -0 and +0 are different in Object.is
      observable.value = -0;
      expect(handler).toHaveBeenCalledTimes(1);

      // NaN is equal to itself in Object.is
      const nanObservable = new ObservableValue(Number.NaN);
      const nanHandler = vi.fn();
      nanObservable.observe(nanHandler);
      nanObservable.value = Number.NaN;
      expect(nanHandler).not.toHaveBeenCalled();
    });
  });

  describe("derive", () => {
    it("should create derived observable with transformed values", () => {
      const observable = new ObservableValue(5);
      const derived = observable.derive((x) => x * 2);

      expect(derived.value).toBe(10);

      observable.value = 10;
      expect(derived.value).toBe(20);
    });

    it("should handle type transformations", () => {
      const observable = new ObservableValue(42);
      const derived = observable.derive((x) => x.toString());

      expect(derived.value).toBe("42");

      observable.value = 100;
      expect(derived.value).toBe("100");
    });

    it("should propagate updates to multiple derived observables", () => {
      const observable = new ObservableValue(1);
      const doubled = observable.derive((x) => x * 2);
      const squared = observable.derive((x) => x * x);
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
      const observable = new ObservableValue("test");
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
      const computed = new ObservableValue("test");
      let cleanupCalled = false;

      computed.addCleanup(() => {
        cleanupCalled = true;
      });

      expect(cleanupCalled).toBe(false);

      computed.destroy();

      expect(cleanupCalled).toBe(true);
    });

    it("should handle multiple cleanup functions", () => {
      const computed = new ObservableValue("test");
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
      const computed = new ObservableValue("test");
      let cleanupCalled = false;

      computed.addCleanup(() => {
        cleanupCalled = true;
      });

      computed.destroy();
      computed.destroy(); // Call destroy twice

      expect(cleanupCalled).toBe(true);
    });
  });
});
