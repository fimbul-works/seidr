import { describe, expect, it } from "vitest";
import { createValue, mergeValues } from ".";
import { unwrapValue } from "./unwrap-value";

describe("unwrapValue", () => {
  describe("unwrapping observables", () => {
    it("should return the value of a observable", () => {
      const observable = createValue("test value");
      expect(unwrapValue(observable)).toBe("test value");
    });

    it("should return the value of a number observable", () => {
      const observable = createValue(42);
      expect(unwrapValue(observable)).toBe(42);
    });

    it("should return the value of a boolean observable", () => {
      const observable = createValue(true);
      expect(unwrapValue(observable)).toBe(true);
    });

    it("should return the value of an object observable", () => {
      const obj = { key: "value" };
      const observable = createValue(obj);
      expect(unwrapValue(observable)).toEqual(obj);
    });

    it("should return the value of an array observable", () => {
      const arr = [1, 2, 3];
      const observable = createValue(arr);
      expect(unwrapValue(observable)).toEqual(arr);
    });

    it("should return the value of a null observable", () => {
      const observable = createValue<string | null>(null);
      expect(unwrapValue(observable)).toBe(null);
    });

    it("should return the value of an undefined observable", () => {
      const observable = createValue<string | undefined>(undefined);
      expect(unwrapValue(observable)).toBe(undefined);
    });

    it("should handle reactive values that change", () => {
      const observable = createValue("initial");
      expect(unwrapValue(observable)).toBe("initial");

      observable("updated");
      expect(unwrapValue(observable)).toBe("updated");
    });

    it("should handle reactive values updated via functional updater", () => {
      const observable = createValue(10);
      expect(unwrapValue(observable)).toBe(10);

      observable((prev) => prev * 2);
      expect(unwrapValue(observable)).toBe(20);
    });

    it("should unwrap derived observables created with .as()", () => {
      const root = createValue(5);
      const derived = root.as((x) => x * 10);
      expect(unwrapValue(derived)).toBe(50);

      root(7);
      expect(unwrapValue(derived)).toBe(70);
    });

    it("should unwrap merged observables created with mergeValues()", () => {
      const a = createValue(3);
      const b = createValue(4);
      const sum = mergeValues(() => a() + b());
      expect(unwrapValue(sum)).toBe(7);

      a(10);
      expect(unwrapValue(sum)).toBe(14);
    });
  });

  describe("unwrapping non-observable values", () => {
    it("should return a non-observable string as-is", () => {
      expect(unwrapValue("plain string")).toBe("plain string");
    });

    it("should return a non-observable number as-is", () => {
      expect(unwrapValue(42)).toBe(42);
    });

    it("should return a non-observable boolean as-is", () => {
      expect(unwrapValue(true)).toBe(true);
    });

    it("should return a non-observable object as-is", () => {
      const obj = { key: "value" };
      expect(unwrapValue(obj)).toBe(obj);
    });

    it("should return a non-observable array as-is", () => {
      const arr = [1, 2, 3];
      expect(unwrapValue(arr)).toBe(arr);
    });

    it("should return null as-is", () => {
      expect(unwrapValue(null)).toBe(null);
    });

    it("should return undefined as-is", () => {
      expect(unwrapValue(undefined)).toBe(undefined);
    });

    it("should return a plain function as-is", () => {
      const fn = () => "hello";
      expect(unwrapValue(fn)).toBe(fn);
    });
  });
});
