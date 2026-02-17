import { describe, expect, it } from "vitest";
import { Seidr } from ".";
import { unwrapSeidr } from "./unwrap-seidr";

describe("unwrapSeidr", () => {
  it("should return the value of a Seidr observable", () => {
    const observable = new Seidr("test value");
    expect(unwrapSeidr(observable)).toBe("test value");
  });

  it("should return the value of a number Seidr", () => {
    const observable = new Seidr(42);
    expect(unwrapSeidr(observable)).toBe(42);
  });

  it("should return the value of a boolean Seidr", () => {
    const observable = new Seidr(true);
    expect(unwrapSeidr(observable)).toBe(true);
  });

  it("should return the value of an object Seidr", () => {
    const obj = { key: "value" };
    const observable = new Seidr(obj);
    expect(unwrapSeidr(observable)).toEqual(obj);
  });

  it("should return the value of an array Seidr", () => {
    const arr = [1, 2, 3];
    const observable = new Seidr(arr);
    expect(unwrapSeidr(observable)).toEqual(arr);
  });

  it("should return the value of a null Seidr", () => {
    const observable = new Seidr<string | null>(null);
    expect(unwrapSeidr(observable)).toBe(null);
  });

  it("should return the value of an undefined Seidr", () => {
    const observable = new Seidr<string | undefined>(undefined);
    expect(unwrapSeidr(observable)).toBe(undefined);
  });

  it("should return a non-Seidr string as-is", () => {
    expect(unwrapSeidr("plain string")).toBe("plain string");
  });

  it("should return a non-Seidr number as-is", () => {
    expect(unwrapSeidr(42)).toBe(42);
  });

  it("should return a non-Seidr boolean as-is", () => {
    expect(unwrapSeidr(true)).toBe(true);
  });

  it("should return a non-Seidr object as-is", () => {
    const obj = { key: "value" };
    expect(unwrapSeidr(obj)).toBe(obj);
  });

  it("should return a non-Seidr array as-is", () => {
    const arr = [1, 2, 3];
    expect(unwrapSeidr(arr)).toBe(arr);
  });

  it("should return null as-is", () => {
    expect(unwrapSeidr(null)).toBe(null);
  });

  it("should return undefined as-is", () => {
    expect(unwrapSeidr(undefined)).toBe(undefined);
  });

  it("should handle reactive values that change", () => {
    const observable = new Seidr("initial");
    expect(unwrapSeidr(observable)).toBe("initial");

    observable.value = "updated";
    expect(unwrapSeidr(observable)).toBe("updated");
  });
});
