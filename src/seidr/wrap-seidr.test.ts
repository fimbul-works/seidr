import { describe, expect, it } from "vitest";
import { Seidr, wrapSeidr } from "./index";

describe("wrapSeidr", () => {
  it("should wrap the value in a Seidr observable", () => {
    const observable = wrapSeidr("test value");
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe("test value");
  });

  it("should wrap the value in a number Seidr", () => {
    const observable = wrapSeidr(42);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(42);
  });

  it("should wrap the value in a boolean Seidr", () => {
    const observable = wrapSeidr(true);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(true);
  });

  it("should wrap the value in an object Seidr", () => {
    const obj = { key: "value" };
    const observable = wrapSeidr(obj);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(obj);
  });

  it("should wrap the value in an array Seidr", () => {
    const arr = [1, 2, 3];
    const observable = wrapSeidr(arr);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(arr);
  });

  it("should wrap the value in a null Seidr", () => {
    const observable = wrapSeidr<string | null>(null);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(null);
  });

  it("should return the value of an undefined Seidr", () => {
    const observable = wrapSeidr<string | undefined>(undefined);
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(undefined);
  });

  it("should not re-wrap a string Seidr", () => {
    const observable = wrapSeidr(new Seidr("string value"));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe("string value");
  });

  it("should not re-wrap a number Seidr", () => {
    const observable = wrapSeidr(new Seidr(42));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(42);
  });

  it("should not re-wrap a boolean Seidr", () => {
    const observable = wrapSeidr(new Seidr(true));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(true);
  });

  it("should not re-wrap an object Seidr", () => {
    const obj = { key: "value" };
    const observable = wrapSeidr(new Seidr(obj));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(obj);
  });

  it("should not re-wrap an array Seidr", () => {
    const arr = [1, 2, 3];
    const observable = wrapSeidr(new Seidr(arr));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(arr);
  });

  it("should not re-warp a null Seidr", () => {
    const observable = wrapSeidr(new Seidr(null));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(null);
  });

  it("should not re-wrap an undefined Seidr", () => {
    const observable = wrapSeidr(new Seidr(undefined));
    expect(observable).toBeInstanceOf(Seidr);
    expect(observable.value).toBe(undefined);
  });
});
