import { describe, expect, it } from "vitest";
import { createValue, isValue, mergeValues } from ".";
import { wrapValue } from "./wrap-value";

describe("wrapValue", () => {
  describe("wrapping non-observable values", () => {
    it("should wrap the value in an observable", () => {
      const observable = wrapValue("test value");
      expect(isValue(observable)).toBe(true);
      expect(observable()).toBe("test value");
    });

    it("should wrap the value in a number observable", () => {
      const observable = wrapValue(42);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toBe(42);
    });

    it("should wrap the value in a boolean observable", () => {
      const observable = wrapValue(true);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toBe(true);
    });

    it("should wrap the value in an object observable", () => {
      const obj = { key: "value" };
      const observable = wrapValue(obj);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toEqual(obj);
    });

    it("should wrap the value in an array observable", () => {
      const arr = [1, 2, 3];
      const observable = wrapValue(arr);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toEqual(arr);
    });

    it("should wrap the value in a null observable", () => {
      const observable = wrapValue<string | null>(null);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toBe(null);
    });

    it("should wrap the value in an undefined observable", () => {
      const observable = wrapValue<string | undefined>(undefined);
      expect(isValue(observable)).toBe(true);
      expect(observable()).toBe(undefined);
    });

    it("should accept ValueOptions when creating a new observable", () => {
      const observable = wrapValue("custom", { id: "custom-wrapped-id" });
      expect(observable.id).toBe("custom-wrapped-id");
      expect(observable()).toBe("custom");
    });

    it("should support custom isEqual option when wrapping", () => {
      const observable = wrapValue({ count: 1 }, { isEqual: (a, b) => a.count === b.count });
      expect(observable()).toEqual({ count: 1 });
      const prev = observable({ count: 1 }); // Same count under custom isEqual
      expect(prev).toEqual({ count: 1 });
    });

    it("should support functional updates on wrapped observables", () => {
      const count = wrapValue(5);
      const prev = count((n) => n * 3);
      expect(prev).toBe(5);
      expect(count()).toBe(15);
    });
  });

  describe("handling already wrapped observable values", () => {
    it("should not re-wrap a string observable", () => {
      const observable = createValue("string value");
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap a number observable", () => {
      const observable = createValue(42);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap a boolean observable", () => {
      const observable = createValue(true);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap an object observable", () => {
      const obj = { key: "value" };
      const observable = createValue(obj);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap an array observable", () => {
      const arr = [1, 2, 3];
      const observable = createValue(arr);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap a null observable", () => {
      const observable = createValue(null);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap an undefined observable", () => {
      const observable = createValue(undefined);
      const wrapped = wrapValue(observable);
      expect(observable).toBe(wrapped);
    });

    it("should not re-wrap derived observables", () => {
      const root = createValue(10);
      const derived = root.as((x) => x * 2);
      const wrapped = wrapValue(derived);
      expect(wrapped).toBe(derived);
    });

    it("should not re-wrap merged observables", () => {
      const a = createValue(1);
      const b = createValue(2);
      const merged = mergeValues(() => a() + b());
      const wrapped = wrapValue(merged);
      expect(wrapped).toBe(merged);
    });

    it("should return the exact same instance even if options are provided", () => {
      const original = createValue(10, { id: "original-id" });
      const wrapped = wrapValue(original, { id: "ignored-id" });
      expect(wrapped).toBe(original);
      expect(wrapped.id).toBe("original-id");
    });
  });
});
