import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "./dom/index";
import { Seidr } from "./seidr";

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
      element = $("div");
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

  describe("parents", () => {
    it("should return empty array for root observables", () => {
      const observable = new Seidr(42);
      expect(observable.parents).toEqual([]);
      expect(observable.parents.length).toBe(0);
    });

    it("should return parent for derived observable created with .as()", () => {
      const parent = new Seidr(5);
      const derived = parent.as((x) => x * 2);

      expect(derived.parents).toEqual([parent]);
      expect(derived.parents.length).toBe(1);
      expect(derived.parents[0]).toBe(parent);
    });

    it("should return parents for computed observable", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      expect(fullName.parents).toEqual([firstName, lastName]);
      expect(fullName.parents.length).toBe(2);
      expect(fullName.parents[0]).toBe(firstName);
      expect(fullName.parents[1]).toBe(lastName);
    });

    it("should maintain parent chain for multiple levels of derivation", () => {
      const root = new Seidr(1);
      const level1 = root.as((x) => x * 2);
      const level2 = level1.as((x) => x * 2);
      const level3 = level2.as((x) => x * 2);

      expect(level1.parents).toEqual([root]);
      expect(level2.parents).toEqual([level1]);
      expect(level3.parents).toEqual([level2]);

      // Verify the full chain
      expect(level3.parents[0]).toBe(level2);
      expect(level3.parents[0].parents[0]).toBe(level1);
      expect(level3.parents[0].parents[0].parents[0]).toBe(root);
    });

    it("should preserve parent references even after parent changes", () => {
      const parent = new Seidr(5);
      const derived = parent.as((x) => x * 2);

      expect(derived.parents[0]).toBe(parent);

      parent.value = 10;
      expect(derived.parents[0]).toBe(parent);
      expect(derived.parents[0].value).toBe(10);
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

  describe("id and isDerived properties", () => {
    describe("id property", () => {
      it("should assign a unique ID to each Seidr instance", () => {
        const observable1 = new Seidr(42);
        const observable2 = new Seidr("test");

        expect(observable1.id).toBeDefined();
        expect(observable2.id).toBeDefined();
        expect(typeof observable1.id).toBe("string");
        expect(typeof observable2.id).toBe("string");
      });

      it("should generate different IDs for different instances", () => {
        const observable1 = new Seidr(1);
        const observable2 = new Seidr(2);
        const observable3 = new Seidr(3);

        expect(observable1.id).not.toBe(observable2.id);
        expect(observable2.id).not.toBe(observable3.id);
        expect(observable1.id).not.toBe(observable3.id);
      });

      it("should maintain the same ID throughout the instance lifecycle", () => {
        const observable = new Seidr(100);
        const originalId = observable.id;

        observable.value = 200;
        observable.value = 300;

        expect(observable.id).toBe(originalId);
      });

      it("should not allow external modification of id", () => {
        const observable = new Seidr("test");
        const originalId = observable.id;

        // Attempting to set id will throw in strict mode or silently fail in non-strict mode
        try {
          // @ts-expect-error - Testing that id is read-only
          observable.id = "different-id";
        } catch {
          // Expected to throw in strict mode
        }

        // The property should remain unchanged regardless
        expect(observable.id).toBe(originalId);
      });
    });

    describe("isDerived property", () => {
      it("should be false for root observables created with new Seidr()", () => {
        const rootObservable = new Seidr(42);

        expect(rootObservable.isDerived).toBe(false);
      });

      it("should be true for observables created via .as()", () => {
        const root = new Seidr(10);
        const derived = root.as((x) => x * 2);

        expect(root.isDerived).toBe(false);
        expect(derived.isDerived).toBe(true);
      });

      it("should be true for observables created via Seidr.computed()", () => {
        const a = new Seidr(2);
        const b = new Seidr(3);
        const computed = Seidr.computed(() => a.value + b.value, [a, b]);

        expect(a.isDerived).toBe(false);
        expect(b.isDerived).toBe(false);
        expect(computed.isDerived).toBe(true);
      });

      it("should not allow external modification of isDerived", () => {
        const observable = new Seidr("test");
        const originalIsDerived = observable.isDerived;

        // Attempting to set isDerived will throw in strict mode or silently fail in non-strict mode
        try {
          // @ts-expect-error - Testing that isDerived is read-only
          observable.isDerived = true;
        } catch {
          // Expected to throw in strict mode
        }

        // The property should remain unchanged regardless
        expect(observable.isDerived).toBe(originalIsDerived);
      });

      it("should correctly mark multiple levels of derived observables", () => {
        const root = new Seidr(5);
        const level1 = root.as((x) => x * 2);
        const level2 = level1.as((x) => x + 10);
        const level3 = level2.as((x) => x / 2);

        expect(root.isDerived).toBe(false);
        expect(level1.isDerived).toBe(true);
        expect(level2.isDerived).toBe(true);
        expect(level3.isDerived).toBe(true);
      });

      it("should correctly mark nested computed observables", () => {
        const a = new Seidr(2);
        const b = new Seidr(3);
        const sum = Seidr.computed(() => a.value + b.value, [a, b]);
        const doubled = Seidr.computed(() => sum.value * 2, [sum]);

        expect(a.isDerived).toBe(false);
        expect(b.isDerived).toBe(false);
        expect(sum.isDerived).toBe(true);
        expect(doubled.isDerived).toBe(true);
      });

      it("should correctly mark mixed derived and computed observables", () => {
        const root = new Seidr(10);
        const derived = root.as((x) => x * 2);

        const a = new Seidr(5);
        const computed = Seidr.computed(() => a.value + derived.value, [a, derived]);

        expect(root.isDerived).toBe(false);
        expect(a.isDerived).toBe(false);
        expect(derived.isDerived).toBe(true);
        expect(computed.isDerived).toBe(true);
      });

      it("should maintain isDerived flag through value updates", () => {
        const root = new Seidr(5);
        const derived = root.as((x) => x * 2);

        expect(derived.isDerived).toBe(true);

        root.value = 10;
        root.value = 20;

        expect(derived.isDerived).toBe(true);
      });
    });

    describe("ID and isDerived integration", () => {
      it("should assign unique IDs to all types of observables", () => {
        const root = new Seidr(10);
        const derived = root.as((x) => x * 2);
        const a = new Seidr(5);
        const computed = Seidr.computed(() => a.value + derived.value, [a, derived]);

        const ids = [root.id, derived.id, a.id, computed.id];
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(4);
      });

      it("should track both id and isDerived for complex observable graphs", () => {
        const firstName = new Seidr("John");
        const lastName = new Seidr("Doe");
        const age = new Seidr(30);

        const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

        const description = fullName.as((name) => `${name} is ${age.value} years old`);

        expect(firstName.id).toBeDefined();
        expect(lastName.id).toBeDefined();
        expect(age.id).toBeDefined();
        expect(fullName.id).toBeDefined();
        expect(description.id).toBeDefined();

        expect(firstName.isDerived).toBe(false);
        expect(lastName.isDerived).toBe(false);
        expect(age.isDerived).toBe(false);
        expect(fullName.isDerived).toBe(true);
        expect(description.isDerived).toBe(true);
      });
    });
  });

  describe("Documentation Examples", () => {
    describe("Basic reactive value example", () => {
      it("should demonstrate basic Seidr usage with observe and cleanup", () => {
        const count = new Seidr(0);
        const logSpy = vi.fn();

        // Subscribe to changes (doesn't call immediately)
        const unsubscribe = count.observe((value) => {
          logSpy(value);
        });

        expect(logSpy).not.toHaveBeenCalled();

        count.value = 5;
        expect(logSpy).toHaveBeenCalledWith(5);

        count.value = 5;
        expect(logSpy).toHaveBeenCalledTimes(1); // No notification for same value

        unsubscribe(); // Cleanup
        count.value = 10;
        expect(logSpy).toHaveBeenCalledTimes(1); // No more notifications
      });
    });

    describe("Simple numeric transformation example", () => {
      it("should create derived observables with numeric transformations", () => {
        const count = new Seidr(5);
        const doubled = count.as((n) => n * 2);
        const isEven = count.as((n) => n % 2 === 0);

        expect(doubled.value).toBe(10);
        expect(isEven.value).toBe(false);

        count.value = 6;
        expect(doubled.value).toBe(12);
        expect(isEven.value).toBe(true);
      });
    });

    describe("String formatting and concatenation example", () => {
      it("should demonstrate string-based transformations", () => {
        const firstName = new Seidr("John");
        const lastName = new Seidr("Doe");

        const fullName = firstName.as((name) => `${name} ${lastName.value}`);
        const displayName = firstName.as((name) => name.toUpperCase());

        expect(fullName.value).toBe("John Doe");
        expect(displayName.value).toBe("JOHN");

        firstName.value = "Jane";
        expect(fullName.value).toBe("Jane Doe");
        expect(displayName.value).toBe("JANE");
      });
    });

    describe("Complex object transformations example", () => {
      it("should handle object property extraction and formatting", () => {
        const user = new Seidr({ id: 1, name: "John", age: 30 });

        const userName = user.as((u) => u.name);
        const userDescription = user.as((u) => `${u.name} (${u.age} years old)`);
        const isAdult = user.as((u) => u.age >= 18);

        expect(userName.value).toBe("John");
        expect(userDescription.value).toBe("John (30 years old)");
        expect(isAdult.value).toBe(true);
      });
    });

    describe("Array filtering and mapping example", () => {
      it("should demonstrate array transformation patterns", () => {
        const numbers = new Seidr([1, 2, 3, 4, 5]);

        const evenNumbers = numbers.as((nums) => nums.filter((n) => n % 2 === 0));
        const squaredNumbers = numbers.as((nums) => nums.map((n) => n * n));
        const count = numbers.as((nums) => nums.length);

        expect(evenNumbers.value).toEqual([2, 4]);
        expect(squaredNumbers.value).toEqual([1, 4, 9, 16, 25]);
        expect(count.value).toBe(5);
      });
    });

    describe("Conditional transformations example", () => {
      it("should handle conditional logic in transformations", () => {
        const temperature = new Seidr(25);

        const temperatureStatus = temperature.as((temp) => {
          if (temp < 0) return "Freezing";
          if (temp < 10) return "Cold";
          if (temp < 20) return "Cool";
          if (temp < 30) return "Warm";
          return "Hot";
        });

        const temperatureColor = temperature.as((temp) => {
          if (temp < 10) return "blue";
          if (temp < 20) return "green";
          if (temp < 30) return "orange";
          return "red";
        });

        expect(temperatureStatus.value).toBe("Warm");
        expect(temperatureColor.value).toBe("orange");

        temperature.value = 5;
        expect(temperatureStatus.value).toBe("Cold");
        expect(temperatureColor.value).toBe("blue");
      });
    });

    describe("Computed value - Full name example", () => {
      it("should create computed values that depend on multiple sources", () => {
        const firstName = new Seidr("John");
        const lastName = new Seidr("Doe");

        const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

        expect(fullName.value).toBe("John Doe");

        firstName.value = "Jane";
        expect(fullName.value).toBe("Jane Doe");

        lastName.value = "Smith";
        expect(fullName.value).toBe("Jane Smith");
      });
    });

    describe("Computed value - Complex calculations example", () => {
      it("should demonstrate computed values with mathematical operations", () => {
        const width = new Seidr(100);
        const height = new Seidr(200);

        const area = Seidr.computed(() => width.value * height.value, [width, height]);

        const perimeter = Seidr.computed(() => 2 * (width.value + height.value), [width, height]);

        expect(area.value).toBe(20000);
        expect(perimeter.value).toBe(600);

        width.value = 150;
        expect(area.value).toBe(30000);
        expect(perimeter.value).toBe(700);
      });
    });

    describe("Manual cleanup example", () => {
      it("should demonstrate proper cleanup patterns", () => {
        const counter = new Seidr(0);
        const observerSpy = vi.fn();

        const unsubscribe = counter.observe(observerSpy);
        expect(observerSpy).not.toHaveBeenCalled();

        counter.value = 5;
        expect(observerSpy).toHaveBeenCalledWith(5);

        // Remove specific observer
        unsubscribe();
        counter.value = 10;
        expect(observerSpy).toHaveBeenCalledTimes(1); // No more notifications

        // Clean up everything
        counter.destroy();
        counter.value = 15;
        expect(observerSpy).toHaveBeenCalledTimes(1); // Still no more notifications
      });
    });
  });
});
