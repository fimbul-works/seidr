import { describe, expect, it, vi } from "vitest";
import { createValue, mergeValues } from ".";
import { wrapValueObject } from "./wrap-value-object";

describe("wrapValueObject", () => {
  describe("default property key ('value')", () => {
    it("should return an object with getter for the observable value", () => {
      const count = createValue(10);
      const target = wrapValueObject(count);

      expect(target.value).toBe(10);
    });

    it("should update the underlying observable when setting the property", () => {
      const count = createValue(10);
      const target = wrapValueObject(count);

      target.value = 25;
      expect(count()).toBe(25);
      expect(target.value).toBe(25);
    });

    it("should reflect changes made directly to the underlying observable", () => {
      const message = createValue("initial");
      const target = wrapValueObject(message);

      expect(target.value).toBe("initial");

      message("updated");
      expect(target.value).toBe("updated");
    });

    it("should reflect changes made via functional updaters on the underlying observable", () => {
      const count = createValue(5);
      const target = wrapValueObject(count);

      count((prev) => prev * 4);
      expect(target.value).toBe(20);
    });
  });

  describe("custom property keys", () => {
    it("should support a custom string key", () => {
      const x = createValue(100);
      const target = wrapValueObject(x, "x");

      expect(target.x).toBe(100);

      target.x = 250;
      expect(x()).toBe(250);
      expect(target.x).toBe(250);
    });

    it("should support descriptive animation property keys like 'opacity' or 'progress'", () => {
      const opacity = createValue(0);
      const target = wrapValueObject(opacity, "opacity");

      expect(target.opacity).toBe(0);

      target.opacity = 0.75;
      expect(opacity()).toBe(0.75);
      expect(target.opacity).toBe(0.75);
    });

    it("should support keys with special characters and spaces", () => {
      const val = createValue("data");
      const target = wrapValueObject(val, "custom-prop-name");

      expect(target["custom-prop-name"]).toBe("data");

      target["custom-prop-name"] = "new data";
      expect(val()).toBe("new data");
      expect(target["custom-prop-name"]).toBe("new data");
    });
  });

  describe("reactivity and watcher triggers", () => {
    it("should trigger .watch() listeners on the observable when mutating via wrapped object", () => {
      const count = createValue(0);
      const target = wrapValueObject(count);
      const watcher = vi.fn();

      count.watch(watcher);

      target.value = 1;
      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(1, 0);

      target.value = 2;
      expect(watcher).toHaveBeenCalledTimes(2);
      expect(watcher).toHaveBeenCalledWith(2, 1);
    });

    it("should trigger .bind() listeners on the observable when mutating via wrapped object", () => {
      const count = createValue(10);
      const target = wrapValueObject(count);
      const binder = vi.fn();

      count.bind(binder);
      expect(binder).toHaveBeenCalledTimes(1);
      expect(binder).toHaveBeenCalledWith(10, 10);

      target.value = 20;
      expect(binder).toHaveBeenCalledTimes(2);
      expect(binder).toHaveBeenCalledWith(20, 10);
    });

    it("should propagate updates to derived observables when mutating via wrapped object", () => {
      const count = createValue(5);
      const doubled = count.as((n) => n * 2);
      const target = wrapValueObject(count);

      expect(doubled()).toBe(10);

      target.value = 15;
      expect(doubled()).toBe(30);
    });

    it("should work with wrapped derived observables as readable targets", () => {
      const count = createValue(4);
      const squared = count.as((n) => n * n);
      const target = wrapValueObject(squared, "squared");

      expect(target.squared).toBe(16);

      count(5);
      expect(target.squared).toBe(25);
    });

    it("should work with wrapped merged observables", () => {
      const a = createValue(10);
      const b = createValue(20);
      const sum = mergeValues(() => a() + b());
      const target = wrapValueObject(sum, "total");

      expect(target.total).toBe(30);

      a(15);
      expect(target.total).toBe(35);
    });
  });

  describe("supporting various data types", () => {
    it("should support boolean values", () => {
      const flag = createValue(false);
      const target = wrapValueObject(flag, "enabled");

      expect(target.enabled).toBe(false);
      target.enabled = true;
      expect(flag()).toBe(true);
    });

    it("should support object values", () => {
      const user = createValue({ name: "Alice", age: 30 });
      const target = wrapValueObject(user, "user");

      expect(target.user).toEqual({ name: "Alice", age: 30 });
      target.user = { name: "Bob", age: 35 };
      expect(user()).toEqual({ name: "Bob", age: 35 });
    });

    it("should support array values", () => {
      const list = createValue([1, 2, 3]);
      const target = wrapValueObject(list, "items");

      expect(target.items).toEqual([1, 2, 3]);
      target.items = [4, 5, 6];
      expect(list()).toEqual([4, 5, 6]);
    });

    it("should support null and undefined values", () => {
      const nullable = createValue<string | null>(null);
      const targetNull = wrapValueObject(nullable);
      expect(targetNull.value).toBe(null);

      targetNull.value = "not null";
      expect(nullable()).toBe("not null");

      const undef = createValue<number | undefined>(undefined);
      const targetUndef = wrapValueObject(undef);
      expect(targetUndef.value).toBe(undefined);

      targetUndef.value = 42;
      expect(undef()).toBe(42);
    });
  });

  describe("OOP and animation library simulation", () => {
    it("should work with an OOP tween / animation function that mutates target properties", () => {
      const x = createValue(0);
      const animTarget = wrapValueObject(x, "x");

      // Simulates an OOP tween step (like Flaedi / GSAP mutating target[prop])
      const animateStep = (target: { x: number }, step: number) => {
        target.x += step;
      };

      animateStep(animTarget, 10);
      expect(x()).toBe(10);
      expect(animTarget.x).toBe(10);

      animateStep(animTarget, 25);
      expect(x()).toBe(35);
      expect(animTarget.x).toBe(35);
    });

    it("should allow multiple wrapped targets bound to separate observables", () => {
      const x = createValue(0);
      const y = createValue(100);

      const targetX = wrapValueObject(x, "x");
      const targetY = wrapValueObject(y, "y");

      targetX.x = 50;
      targetY.y = 200;

      expect(x()).toBe(50);
      expect(y()).toBe(200);
      expect(targetX.x).toBe(50);
      expect(targetY.y).toBe(200);
    });

    it("should define valid getter and setter property descriptors on the object", () => {
      const val = createValue("test");
      const target = wrapValueObject(val, "prop");

      const descriptor = Object.getOwnPropertyDescriptor(target, "prop");
      expect(descriptor).toBeDefined();
      expect(typeof descriptor?.get).toBe("function");
      expect(typeof descriptor?.set).toBe("function");
    });
  });
});
