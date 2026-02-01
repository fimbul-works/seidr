import { describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { createDatasetProxy } from "./dataset-proxy";

describe("DatasetProxy", () => {
  it("should map camelCase to kebab-case with data- prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createDatasetProxy(storage);

    proxy.seidrId = "123";
    expect(storage["data-seidr-id"]).toBe("123");
    expect(proxy.seidrId).toBe("123");
  });

  it("should support kebab-case keys with data- prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createDatasetProxy(storage);

    proxy["data-test-value"] = "hello";
    expect(storage["data-test-value"]).toBe("hello");
    expect(proxy.testValue).toBe("hello");
  });

  it("should NOT unwrap Seidr values in the getter", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createDatasetProxy(storage);
    const s = new Seidr("initial");

    proxy.reactive = s;
    expect(proxy.reactive).toBe(s);
    expect(proxy.reactive.value).toBe("initial");
  });

  it("should drop 'data-' prefix for ownKeys", () => {
    const storage = {
      "data-one": "1",
      "data-two-three": "23",
      other: "non-data",
    };
    const { proxy } = createDatasetProxy(storage);

    expect(Object.keys(proxy)).toEqual(["one", "twoThree"]);
  });

  it("should handle deleteProperty", () => {
    const storage = { "data-foo": "bar" };
    const { proxy } = createDatasetProxy(storage);

    delete proxy.foo;
    expect(storage["data-foo"]).toBeUndefined();
  });
});
