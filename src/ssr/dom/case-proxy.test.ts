import { describe, expect, it, vi } from "vitest";
import { Seidr } from "../../seidr";
import { createCaseProxy } from "./case-proxy";

describe("CaseProxy", () => {
  it("should map camelCase to kebab-case with prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createCaseProxy({
      prefix: "data-",
      storage,
    });

    proxy.testValue = "hello";
    expect(storage["data-test-value"]).toBe("hello");
    expect(proxy.testValue).toBe("hello");
  });

  it("should allow accessing keys that already have the prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createCaseProxy({
      prefix: "data-",
      storage,
    });

    proxy["data-raw-key"] = "world";
    expect(storage["data-raw-key"]).toBe("world");
    // If dropPrefix is false (default), it maps back to dataRawKey
    expect(proxy.dataRawKey).toBe("world");
  });

  it("should NOT unwrap Seidr values on access", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createCaseProxy({ storage });
    const s = new Seidr("initial");

    proxy.reactive = s;
    expect(storage["reactive"]).toBe(s);
    expect(proxy.reactive).toBe(s);
  });

  it("should support dropPrefix: true", () => {
    const storage: Record<string, any> = { "data-foo": "bar" };
    const { proxy } = createCaseProxy({ prefix: "data-", dropPrefix: true, storage });

    expect(proxy.foo).toBe("bar");
    expect(Object.keys(proxy)).toEqual(["foo"]);
  });

  it("should handle fromString and toString if provided", () => {
    const serialize = (s: any) => JSON.stringify(s);
    const parse = (v: string) => JSON.parse(v);
    const { proxy, fromString, toString: localToString } = createCaseProxy({ serialize, parse });

    fromString('{"test-key":"val"}');
    expect(proxy.testKey).toBe("val");
    expect(localToString()).toBe('{"test-key":"val"}');
  });

  it("should throw an error for invalid property names", () => {
    const { proxy } = createCaseProxy();
    expect(() => {
      (proxy as any)["this-isNot-valid"] = "value";
    }).toThrow('Invalid property name: "this-isNot-valid". Must be camelCase or kebab-case.');

    expect(() => {
      return (proxy as any)["InvalidCase"];
    }).toThrow('Invalid property name: "InvalidCase". Must be camelCase or kebab-case.');
  });
});
