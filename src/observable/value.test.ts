import { describe, expect, it, vi } from "vitest";
import { TYPE_PROP } from "../constants.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import { createValue, mergeValues, TYPE_VALUE } from "./value";

describeDualMode("Value", () => {
  describe("createValue", () => {
    describe("basic functionality", () => {
      it("should initialize with the provided value", () => {
        const value = createValue(42);
        expect(value()).toBe(42);
      });

      it("should handle different types of values", () => {
        const numberVal = createValue(123);
        const stringVal = createValue("test");
        const boolVal = createValue(true);
        const objVal = createValue({ foo: "bar" });
        const arrayVal = createValue([1, 2, 3]);

        expect(numberVal()).toBe(123);
        expect(stringVal()).toBe("test");
        expect(boolVal()).toBe(true);
        expect(objVal()).toEqual({ foo: "bar" });
        expect(arrayVal()).toEqual([1, 2, 3]);
      });

      it("should handle null and undefined", () => {
        const nullVal = createValue(null);
        const undefinedVal = createValue(undefined);

        expect(nullVal()).toBeNull();
        expect(undefinedVal()).toBeUndefined();
      });

      it("should initialize to undefined when called without arguments", () => {
        const value = createValue();
        expect(value()).toBeUndefined();
      });
    });

    describe("value get and set", () => {
      it("should return the current value", () => {
        const value = createValue("test");
        expect(value()).toBe("test");
      });

      it("should update and return the latest value", () => {
        const value = createValue("initial");
        value("updated");
        expect(value()).toBe("updated");
      });

      it("should return the previous value when setting", () => {
        const value = createValue("initial");
        const prev = value("updated");
        expect(prev).toBe("initial");
        expect(value()).toBe("updated");
      });

      it("should not notify watchers when setting the same value", () => {
        const value = createValue("test");
        const handler = vi.fn();

        value.watch(handler);
        value("test");

        expect(handler).not.toHaveBeenCalled();
      });

      it("should handle Object.is edge cases", () => {
        const value = createValue(0);
        const handler = vi.fn();
        value.watch(handler);

        // -0 and +0 are different in Object.is
        value(-0);
        expect(handler).toHaveBeenCalledTimes(1);

        // NaN is equal to itself in Object.is
        const nanValue = createValue(Number.NaN);
        const nanHandler = vi.fn();
        nanValue.watch(nanHandler);
        nanValue(Number.NaN);
        expect(nanHandler).not.toHaveBeenCalled();
      });

      it("should support custom isEqual function", () => {
        const value = createValue([1, 2], {
          isEqual: (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]),
        });
        const handler = vi.fn();

        value.watch(handler);

        // Same array reference - should not notify
        const sameArr = value();
        value(sameArr);
        expect(handler).not.toHaveBeenCalled();

        // Different array with same content - should NOT notify (custom deep equality)
        value([1, 2]);
        expect(handler).not.toHaveBeenCalled();

        // Different content - should notify
        value([1, 2, 3]);
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it("should support shallow equality with custom isEqual", () => {
        const value = createValue(
          { foo: "bar" },
          {
            isEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),
          },
        );
        const handler = vi.fn();

        value.watch(handler);

        // Same content - should not notify
        value({ foo: "bar" });
        expect(handler).not.toHaveBeenCalled();

        // Different content - should notify
        value({ foo: "baz" });
        expect(handler).toHaveBeenCalledTimes(1);
      });
    });

    describe("functional updates", () => {
      it("should update value using an updater function", () => {
        const counter = createValue(1);
        counter((i) => i + 1);
        expect(counter()).toBe(2);
      });

      it("should return the previous value when using an updater function", () => {
        const counter = createValue(1);
        const oldValue = counter((i) => i + 1);
        expect(oldValue).toBe(1);
        expect(counter()).toBe(2);
      });

      it("should support chained functional updates in sequence", () => {
        const counter = createValue(0);

        const r1 = counter((c) => c + 10);
        expect(r1).toBe(0);
        expect(counter()).toBe(10);

        const r2 = counter((c) => c * 3);
        expect(r2).toBe(10);
        expect(counter()).toBe(30);

        const r3 = counter((c) => c - 5);
        expect(r3).toBe(30);
        expect(counter()).toBe(25);
      });

      it("should work with object state updates via immutability pattern", () => {
        const user = createValue({ name: "Alice", score: 10 });
        const prev = user((u) => ({ ...u, score: u.score + 5 }));

        expect(prev).toEqual({ name: "Alice", score: 10 });
        expect(user()).toEqual({ name: "Alice", score: 15 });
      });

      it("should work with array state updates via spread pattern", () => {
        const list = createValue<number[]>([1, 2]);
        const prev = list((items) => [...items, 3]);

        expect(prev).toEqual([1, 2]);
        expect(list()).toEqual([1, 2, 3]);
      });

      it("should not notify watchers if updater returns equal value under default Object.is", () => {
        const value = createValue(42);
        const handler = vi.fn();
        value.watch(handler);

        const prev = value((v) => v);

        expect(prev).toBe(42);
        expect(value()).toBe(42);
        expect(handler).not.toHaveBeenCalled();
      });

      it("should not notify watchers if updater returns equal value under custom isEqual", () => {
        const value = createValue({ count: 10 }, { isEqual: (a, b) => a.count === b.count });
        const handler = vi.fn();
        value.watch(handler);

        // Returning new object instance with same count
        const prev = value((v) => ({ count: v.count }));

        expect(prev).toEqual({ count: 10 });
        expect(handler).not.toHaveBeenCalled();
      });

      it("should notify watchers if updater returns different value under custom isEqual", () => {
        const value = createValue({ count: 10 }, { isEqual: (a, b) => a.count === b.count });
        const handler = vi.fn();
        value.watch(handler);

        const prev = value((v) => ({ count: v.count + 1 }));

        expect(prev).toEqual({ count: 10 });
        expect(value()).toEqual({ count: 11 });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ count: 11 }, { count: 10 });
      });

      it("should pass (newValue, prevValue) to watch handlers on functional update", () => {
        const counter = createValue(5);
        const handler = vi.fn();
        counter.watch(handler);

        counter((c) => c + 15);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(20, 5);
      });

      it("should pass (newValue, prevValue) to bind handlers on functional update", () => {
        const counter = createValue(5);
        const handler = vi.fn();
        counter.bind(handler);

        // Immediate call
        expect(handler).toHaveBeenNthCalledWith(1, 5, 5);

        counter((c) => c * 2);

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenNthCalledWith(2, 10, 5);
      });

      it("should propagate functional updates to derived .as() values", () => {
        const counter = createValue(1);
        const doubled = counter.as((v) => v * 2);

        expect(doubled()).toBe(2);

        counter((i) => i + 1);

        expect(counter()).toBe(2);
        expect(doubled()).toBe(4);
      });

      it("should propagate functional updates to mergeValues() computations", () => {
        const a = createValue(2);
        const b = createValue(3);
        const sum = mergeValues(() => a() + b());

        expect(sum()).toBe(5);

        a((prev) => prev + 10);

        expect(a()).toBe(12);
        expect(sum()).toBe(15);
      });

      it("should work when updating from an undefined initial value", () => {
        const val = createValue<number | undefined>(undefined);
        val((prev) => (prev ?? 0) + 1);
        expect(val()).toBe(1);
      });
    });

    describe("signal pattern (isEqual: () => false)", () => {
      it("should notify watchers on every set call even if value is identical", () => {
        const signal = createValue(0, { isEqual: () => false });
        const handler = vi.fn();
        signal.watch(handler);

        signal(0);
        signal(0);
        signal(0);

        expect(handler).toHaveBeenCalledTimes(3);
        expect(handler).toHaveBeenNthCalledWith(1, 0, 0);
        expect(handler).toHaveBeenNthCalledWith(2, 0, 0);
        expect(handler).toHaveBeenNthCalledWith(3, 0, 0);
      });

      it("should notify watchers on every functional update even if return value is identical", () => {
        const signal = createValue(10, { isEqual: () => false });
        const handler = vi.fn();
        signal.watch(handler);

        signal((prev) => prev);
        signal((prev) => prev);

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenNthCalledWith(1, 10, 10);
        expect(handler).toHaveBeenNthCalledWith(2, 10, 10);
      });

      it("should return the previous value on signal updates", () => {
        const signal = createValue("event1", { isEqual: () => false });
        const prev = signal("event1");
        expect(prev).toBe("event1");
        expect(signal()).toBe("event1");
      });
    });

    describe("TYPE_PROP and metadata properties", () => {
      it("should define TYPE_PROP as TYPE_VALUE", () => {
        const value = createValue(42);
        expect(value[TYPE_PROP]).toBe(TYPE_VALUE);
        expect(value[TYPE_PROP]).toBe("value");
      });

      it("should set metadata properties as read-only", () => {
        const value = createValue(42);

        expect(() => {
          // @ts-expect-error
          value[TYPE_PROP] = "something-else";
        }).toThrow();

        expect(() => {
          // @ts-expect-error
          value.id = "new-id";
        }).toThrow();

        expect(() => {
          // @ts-expect-error
          value.isDerived = true;
        }).toThrow();
      });
    });

    describe("isDerived property", () => {
      it("should be false for root values created with createValue()", () => {
        const rootValue = createValue(42);
        expect(rootValue.isDerived).toBe(false);
      });

      it("should be true for values created via .as()", () => {
        const root = createValue(10);
        const derived = root.as((x) => x * 2);

        expect(root.isDerived).toBe(false);
        expect(derived.isDerived).toBe(true);
      });

      it("should be true for values created via mergeValues()", () => {
        const a = createValue(2);
        const b = createValue(3);
        const merged = mergeValues(() => a() + b());

        expect(a.isDerived).toBe(false);
        expect(b.isDerived).toBe(false);
        expect(merged.isDerived).toBe(true);
      });

      it("should correctly mark multiple levels of derived values", () => {
        const root = createValue(5);
        const level1 = root.as((x) => x * 2);
        const level2 = level1.as((x) => x + 10);
        const level3 = level2.as((x) => x / 2);

        expect(root.isDerived).toBe(false);
        expect(level1.isDerived).toBe(true);
        expect(level2.isDerived).toBe(true);
        expect(level3.isDerived).toBe(true);
      });

      it("should correctly mark nested merged values", () => {
        const a = createValue(2);
        const b = createValue(3);
        const sum = mergeValues(() => a() + b());
        const doubled = mergeValues(() => sum() * 2);

        expect(a.isDerived).toBe(false);
        expect(b.isDerived).toBe(false);
        expect(sum.isDerived).toBe(true);
        expect(doubled.isDerived).toBe(true);
      });
    });

    describe("parents getter", () => {
      it("should return empty array for root values", () => {
        const value = createValue(42);
        expect(value.parents).toEqual([]);
        expect(value.parents.length).toBe(0);
      });

      it("should return parent for derived value created with .as()", () => {
        const parent = createValue(5);
        const derived = parent.as((x) => x * 2);

        expect(derived.parents).toEqual([parent]);
        expect(derived.parents.length).toBe(1);
        expect(derived.parents[0]).toBe(parent);
      });

      it("should return parents for merged value", () => {
        const firstName = createValue("John");
        const lastName = createValue("Doe");
        const fullName = mergeValues(() => `${firstName()} ${lastName()}`);

        expect(fullName.parents).toEqual([firstName, lastName]);
        expect(fullName.parents.length).toBe(2);
        expect(fullName.parents[0]).toBe(firstName);
        expect(fullName.parents[1]).toBe(lastName);
      });

      it("should maintain parent chain for multiple levels of derivation", () => {
        const root = createValue(1);
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
        const parent = createValue(5);
        const derived = parent.as((x) => x * 2);

        expect(derived.parents[0]).toBe(parent);

        parent(10);
        expect(derived.parents[0]).toBe(parent);
        expect(derived.parents[0]()).toBe(10);
      });

      it("should return empty array for root values with multiple transformations", () => {
        const root = createValue(10);
        expect(root.parents).toEqual([]);

        const derived = root.as((x) => x * 2);
        expect(derived.parents).toEqual([root]);
      });
    });

    describe("observerCount getter", () => {
      it("should report correct observer count", () => {
        const value = createValue("test");
        expect(value.observerCount).toBe(0);

        const unsub1 = value.watch(() => {});
        expect(value.observerCount).toBe(1);

        const unsub2 = value.watch(() => {});
        expect(value.observerCount).toBe(2);

        unsub1();
        expect(value.observerCount).toBe(1);

        unsub2();
        expect(value.observerCount).toBe(0);
      });

      it("should count watchers from bind", () => {
        const value = createValue("test");
        expect(value.observerCount).toBe(0);

        const cleanup = value.bind(() => {});
        expect(value.observerCount).toBe(1);

        cleanup();
        expect(value.observerCount).toBe(0);
      });

      it("should not count duplicate watchers with same function reference", () => {
        const value = createValue("test");
        const handler = () => {};

        const unsub1 = value.watch(handler);
        expect(value.observerCount).toBe(1);

        // Same function reference - Set prevents duplicates
        value.watch(handler);
        expect(value.observerCount).toBe(1);

        unsub1(); // Removes the handler
        expect(value.observerCount).toBe(0);
      });

      it("should count different watchers separately", () => {
        const value = createValue("test");
        const handler1 = () => {};
        const handler2 = () => {};

        value.watch(handler1);
        expect(value.observerCount).toBe(1);

        value.watch(handler2);
        expect(value.observerCount).toBe(2);
      });
    });

    describe("watch", () => {
      it("should call handler when value changes", () => {
        const value = createValue("initial");
        const handler = vi.fn();

        value.watch(handler);

        expect(handler).not.toHaveBeenCalled();

        value("updated");

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith("updated", "initial");
      });

      it("should call handler multiple times for multiple changes", () => {
        const value = createValue(0);
        const handler = vi.fn();

        value.watch(handler);

        value(1);
        value(2);
        value(3);

        expect(handler).toHaveBeenCalledTimes(3);
        expect(handler).toHaveBeenNthCalledWith(1, 1, 0);
        expect(handler).toHaveBeenNthCalledWith(2, 2, 1);
        expect(handler).toHaveBeenNthCalledWith(3, 3, 2);
      });

      it("should return cleanup function", () => {
        const value = createValue("test");
        const handler = vi.fn();

        const cleanup = value.watch(handler);

        expect(typeof cleanup).toBe("function");

        // Call cleanup to verify it doesn't throw
        expect(() => cleanup()).not.toThrow();
      });

      it("should stop calling handler after cleanup", () => {
        const value = createValue("initial");
        const handler = vi.fn();

        const cleanup = value.watch(handler);

        value("first");
        expect(handler).toHaveBeenCalledTimes(1);

        cleanup();

        value("second");

        // Should still only have one call from before cleanup
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it("should support multiple watchers", () => {
        const value = createValue(0);
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        const cleanup1 = value.watch(handler1);
        const cleanup2 = value.watch(handler2);

        value(1);

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);

        cleanup1();

        value(2);

        // Handler 1 should not be called after cleanup
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);

        // Clean up the remaining watcher
        cleanup2();
      });

      it("should allow unsubscribing from within the watcher callback without errors", () => {
        const value = createValue(0);
        let callCount = 0;
        let unsubscribe: () => void;

        unsubscribe = value.watch((val) => {
          callCount++;
          if (val === 1) {
            unsubscribe();
          }
        });

        value(1);
        value(2);

        expect(callCount).toBe(1);
        expect(value.observerCount).toBe(0);
      });
    });

    describe("bind", () => {
      it("should call handler immediately with current value", () => {
        const value = createValue("initial");
        const handler = vi.fn();

        value.bind(handler);

        expect(handler).toHaveBeenCalledWith("initial", "initial");
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it("should call handler when value changes", () => {
        const value = createValue("initial");
        const handler = vi.fn();

        value.bind(handler);

        expect(handler).toHaveBeenCalledTimes(1);

        value("new value");

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenNthCalledWith(1, "initial", "initial");
        expect(handler).toHaveBeenNthCalledWith(2, "new value", "initial");
      });

      it("should return cleanup function", () => {
        const value = createValue("test");
        const handler = vi.fn();

        const cleanup = value.bind(handler);

        expect(typeof cleanup).toBe("function");

        // Call cleanup to verify it doesn't throw
        expect(() => cleanup()).not.toThrow();
      });

      it("should stop calling handler after cleanup", () => {
        const value = createValue("initial");
        const handler = vi.fn();

        const cleanup = value.bind(handler);

        // Initial call
        expect(handler).toHaveBeenCalledTimes(1);

        cleanup();

        // Value change after cleanup should not trigger handler
        value("new value");

        // Should still only have the initial call
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it("should work with different types", () => {
        const numberVal = createValue(42);
        const handler = vi.fn();

        numberVal.bind(handler);

        expect(handler).toHaveBeenCalledWith(42, 42);

        numberVal(100);

        expect(handler).toHaveBeenCalledWith(100, 42);
      });
    });

    describe("cleanup", () => {
      it("should register cleanup functions", () => {
        const value = createValue("test");
        const cleanupFn = vi.fn();

        value.cleanup(cleanupFn);

        // Cleanup function should be called on destroy
        value.destroy();

        expect(cleanupFn).toHaveBeenCalledTimes(1);
      });

      it("should call multiple cleanup functions on destroy", () => {
        const value = createValue("test");
        const cleanupFn1 = vi.fn();
        const cleanupFn2 = vi.fn();

        value.cleanup(cleanupFn1);
        value.cleanup(cleanupFn2);

        value.destroy();

        expect(cleanupFn1).toHaveBeenCalledTimes(1);
        expect(cleanupFn2).toHaveBeenCalledTimes(1);
      });
    });

    describe("destroy", () => {
      it("should remove all watchers", () => {
        const value = createValue("test");
        const handler = vi.fn();

        value.watch(handler);
        value.destroy();

        value("updated");

        expect(handler).not.toHaveBeenCalled();
      });

      it("should call all cleanup functions", () => {
        const value = createValue("test");
        const cleanupFn = vi.fn();

        value.cleanup(cleanupFn);
        value.destroy();

        expect(cleanupFn).toHaveBeenCalledTimes(1);
      });

      it("should not throw when destroyed multiple times", () => {
        const value = createValue("test");

        value.destroy();
        expect(() => value.destroy()).not.toThrow();
      });

      it("should unregister watcher on parent when derived .as() value is destroyed", () => {
        const parent = createValue(10);
        const derived = parent.as((x) => x * 2);

        expect(parent.observerCount).toBe(1);

        derived.destroy();

        expect(parent.observerCount).toBe(0);

        // Updating parent should no longer trigger recomputation of destroyed derived
        parent(20);
        expect(parent()).toBe(20);
      });

      it("should unregister watchers on all parents when mergeValues() derived value is destroyed", () => {
        const a = createValue(1);
        const b = createValue(2);
        const sum = mergeValues(() => a() + b());

        expect(a.observerCount).toBe(1);
        expect(b.observerCount).toBe(1);

        sum.destroy();

        expect(a.observerCount).toBe(0);
        expect(b.observerCount).toBe(0);
      });
    });

    describe("as", () => {
      it("should create derived value with transformed values", () => {
        const value = createValue(5);
        const derived = value.as((x) => x * 2);

        expect(derived()).toBe(10);

        value(10);
        expect(derived()).toBe(20);
      });

      it("should handle type transformations", () => {
        const value = createValue(42);
        const derived = value.as((x) => x.toString());

        expect(derived()).toBe("42");

        value(100);
        expect(derived()).toBe("100");
      });

      it("should propagate updates to multiple derived values", () => {
        const value = createValue(1);
        const doubled = value.as((x) => x * 2);
        const squared = value.as((x) => x * x);
        const doubledHandler = vi.fn();
        const squaredHandler = vi.fn();

        doubled.watch(doubledHandler);
        squared.watch(squaredHandler);

        value(3);

        expect(doubled()).toBe(6);
        expect(squared()).toBe(9);
        expect(doubledHandler).toHaveBeenCalledWith(6, 2);
        expect(squaredHandler).toHaveBeenCalledWith(9, 1);
      });

      it("should support custom isEqual option", () => {
        const value = createValue(5);
        const derived = value.as((x) => ({ doubled: x * 2 }), { isEqual: (a, b) => a.doubled === b.doubled });

        const handler = vi.fn();
        derived.watch(handler);

        // Same derived value - should not notify
        value(5);
        expect(handler).not.toHaveBeenCalled();

        // Different value
        value(10);
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it("should allow manual setting on derived value and return previous value", () => {
        const root = createValue(5);
        const derived = root.as((x) => x * 2);

        expect(derived()).toBe(10);

        const prev = derived(99);
        expect(prev).toBe(10);
        expect(derived()).toBe(99);

        // Parent update should overwrite manual set with recomputed value
        root(6);
        expect(derived()).toBe(12);
      });

      it("should allow functional updates on derived value", () => {
        const root = createValue(5);
        const derived = root.as((x) => x * 2);

        const prev = derived((d) => d + 5);
        expect(prev).toBe(10);
        expect(derived()).toBe(15);
      });
    });
  });

  describe("mergeValues", () => {
    it("should return a Value function", () => {
      const a = createValue(1);
      const result = mergeValues(() => a() * 2);

      expect(typeof result).toBe("function");
      expect(result.isDerived).toBe(true);
    });

    it("should create derived value with initial computation", () => {
      const a = createValue(2);
      const b = createValue(3);

      const sum = mergeValues(() => a() + b());

      expect(sum()).toBe(5);
    });

    it("should update when dependencies change", () => {
      const a = createValue(2);
      const b = createValue(3);

      const sum = mergeValues(() => a() + b());

      expect(sum()).toBe(5);

      a(10);
      expect(sum()).toBe(13);

      b(7);
      expect(sum()).toBe(17);
    });

    it("should work with multiple dependencies", () => {
      const firstName = createValue("John");
      const lastName = createValue("Doe");
      const age = createValue(30);

      const fullName = mergeValues(() => `${firstName()} ${lastName()}, age ${age()}`);

      expect(fullName()).toBe("John Doe, age 30");

      lastName("Smith");
      expect(fullName()).toBe("John Smith, age 30");

      age(31);
      expect(fullName()).toBe("John Smith, age 31");
    });

    it("should work with merged values as dependencies", () => {
      const a = createValue(2);
      const b = createValue(3);
      const sum = mergeValues(() => a() + b());
      const doubled = mergeValues(() => sum() * 2);

      expect(doubled()).toBe(10);

      a(5);
      expect(sum()).toBe(8);
      expect(doubled()).toBe(16);
    });

    it("should not update when unrelated values change", () => {
      const a = createValue(2);
      const unrelated = createValue("unrelated");

      const sum = mergeValues(() => a() + 1);

      expect(sum()).toBe(3);

      unrelated("changed");

      expect(sum()).toBe(3); // Should remain unchanged
    });

    it("should auto-discover all accessed values during initial computation", () => {
      const a = createValue(1);
      const b = createValue(2);
      const c = createValue(3);

      // All values accessed in the merge function during initial call are tracked
      const result = mergeValues(() => {
        // Conditionally access based on another value's state
        if (a() > 0) {
          return b() + c();
        }
        return 0;
      });

      expect(result()).toBe(5); // 2 + 3 (initial computation with a=1, b=2, c=3)

      b(10);
      expect(result()).toBe(13); // 10 + 3

      c(5);
      expect(result()).toBe(15); // 10 + 5

      a(-1);
      // a() changing triggers re-computation, but now a < 0 so returns 0
      expect(result()).toBe(0);
    });

    it("should discover all values accessed regardless of conditional branches", () => {
      const a = createValue(1);
      const b = createValue(2);
      const c = createValue(3);

      const result = mergeValues(() => {
        if (a() > 0) {
          return b() + c();
        }
        return c();
      });

      expect(result()).toBe(5); // 2 + 3

      c(10);
      expect(result()).toBe(12); // 2 + 10

      b(5);
      expect(result()).toBe(15); // 5 + 10
    });

    it("should support custom isEqual option", () => {
      const a = createValue({ x: 1 });
      const b = createValue({ y: 2 });

      const sum = mergeValues(() => ({ total: a().x + b().y }), { isEqual: (a, b) => a.total === b.total });

      const handler = vi.fn();
      sum.watch(handler);

      // Accessing different object with same sum
      // @ts-expect-error
      a({ x: 1, extra: "ignored" });
      expect(handler).not.toHaveBeenCalled();
    });

    it("should support explicit options.parents", () => {
      const a = createValue(1);
      const b = createValue(2);
      const derived = mergeValues(() => 100, { parents: [a, b] });

      expect(derived.parents).toEqual([a, b]);
    });

    it("should safely restore parentValues tracking stack if mergeFn throws an error", () => {
      expect(() => {
        mergeValues(() => {
          throw new Error("Computation failed");
        });
      }).toThrow("Computation failed");

      // Creating a new value afterwards should not have phantom tracking parents
      const nextVal = createValue(42);
      expect(nextVal.parents).toEqual([]);
    });

    it("should allow manual setter and functional update on merged value", () => {
      const a = createValue(2);
      const b = createValue(3);
      const sum = mergeValues(() => a() + b());

      expect(sum()).toBe(5);

      const prev = sum(50);
      expect(prev).toBe(5);
      expect(sum()).toBe(50);

      sum((prev) => prev + 10);
      expect(sum()).toBe(60);

      // Recomputes on dependency update
      a(5);
      expect(sum()).toBe(8);
    });

    describe("conditional dependency tracking", () => {
      it("should only track values that are actually accessed", () => {
        const a = createValue(1);
        const b = createValue(2);
        const c = createValue(3);

        const condition = createValue(true);

        const result = mergeValues(() => {
          if (condition()) {
            return a() + b();
          }
          return c();
        });

        expect(result()).toBe(3); // a() + b()

        b(10);
        expect(result()).toBe(11); // 1 + 10

        c(100);
        expect(result()).toBe(11); // unchanged, c() not accessed

        condition(false);
        expect(result()).toBe(100); // c()
      });

      it("should handle nested conditional access", () => {
        const a = createValue(1);
        const b = createValue(2);
        const mode = createValue("add");

        const result = mergeValues(() => {
          if (mode() === "add") {
            return a() + b();
          }
          return a() * b();
        });

        expect(result()).toBe(3);

        a(5);
        expect(result()).toBe(7);

        mode("multiply");
        expect(result()).toBe(10);

        b(3);
        expect(result()).toBe(15);
      });
    });

    describe("circular dependency safety", () => {
      it("should handle self-referential computed safely", () => {
        const base = createValue(1);
        const derived = mergeValues(() => base() * 2);

        // Changing the derived value should not affect tracking
        derived(100);
        expect(derived()).toBe(100);

        // But when base changes, it recomputes
        base(2);
        expect(derived()).toBe(4);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complex reactive graph", () => {
      const firstName = createValue("John");
      const lastName = createValue("Doe");
      const age = createValue(30);

      const fullName = mergeValues(() => `${firstName()} ${lastName()}`);

      const description = mergeValues(() => {
        return `${fullName()} is ${age()} years old`;
      });

      expect(description()).toBe("John Doe is 30 years old");

      lastName("Smith");
      expect(description()).toBe("John Smith is 30 years old");

      age(31);
      expect(description()).toBe("John Smith is 31 years old");
    });

    it("should work with nested transformations", () => {
      const base = createValue(1);
      const doubled = base.as((x) => x * 2);
      const quadrupled = doubled.as((x) => x * 2);
      const withText = quadrupled.as((x) => `${x} items`);

      expect(withText()).toBe("4 items");

      base(2);
      expect(withText()).toBe("8 items");
    });

    it("should allow selective updates with custom equality", () => {
      const source = createValue({ count: 0, name: "test" });
      let deriveCount = 0;
      let derivedNotifyCount = 0;

      const derived = mergeValues(
        () => {
          deriveCount++;
          return { count: source().count };
        },
        {
          isEqual: (a: any, b: any) => a.count === b.count,
        },
      );

      derived.watch(() => derivedNotifyCount++);

      // Initial computation
      expect(deriveCount).toBe(1);
      expect(derived().count).toBe(0);
      expect(derivedNotifyCount).toBe(0);

      // Changing count triggers recomputation AND notification
      source({ count: 1, name: "test" });
      expect(deriveCount).toBe(2);
      expect(derived().count).toBe(1);
      expect(derivedNotifyCount).toBe(1);

      // Changing only name triggers recomputation but NOT notification
      source({ count: 1, name: "changed" });
      expect(deriveCount).toBe(3); // Still recomputed
      expect(derivedNotifyCount).toBe(1); // But not notified
    });
  });

  describe("id property", () => {
    it("should assign a unique ID to each Value instance", () => {
      const value1 = createValue(42);
      const value2 = createValue("test");

      expect(value1.id).toBeDefined();
      expect(value2.id).toBeDefined();
      expect(typeof value1.id).toBe("string");
      expect(typeof value2.id).toBe("string");
    });

    it("should generate different IDs for different instances", () => {
      const value1 = createValue(1);
      const value2 = createValue(2);
      const value3 = createValue(3);

      expect(value1.id).not.toBe(value2.id);
      expect(value2.id).not.toBe(value3.id);
      expect(value1.id).not.toBe(value3.id);
    });

    it("should maintain the same ID throughout the instance lifecycle", () => {
      const value = createValue(100);
      const originalId = value.id;

      value(200);
      value(300);

      expect(value.id).toBe(originalId);
    });

    it("should not allow external modification of id", () => {
      const value = createValue("test");
      const originalId = value.id;

      try {
        // @ts-expect-error - Testing that id is read-only
        value.id = 999;
      } catch {
        // Expected to throw in strict mode
      }

      expect(value.id).toBe(originalId);
    });

    it("should allow custom ID to be provided", () => {
      const value = createValue(42, { id: "custom-id" });

      expect(value.id).toBe("custom-id");
    });
  });

  describe("ID and isDerived integration", () => {
    it("should assign unique IDs to all types of observables", () => {
      const root = createValue(10);
      const derived = root.as((x) => x * 2);
      const a = createValue(5);
      const merged = mergeValues(() => a() + derived());

      const ids = [root.id, derived.id, a.id, merged.id];
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(4);
    });

    it("should track both id and isDerived for complex observable graphs", () => {
      const firstName = createValue("John");
      const lastName = createValue("Doe");
      const age = createValue(30);

      const fullName = mergeValues(() => `${firstName()} ${lastName()}`);

      const description = fullName.as((name) => `${name} is ${age()} years old`);

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
