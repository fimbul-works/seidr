import { describe, expect, test, vi } from "vitest";
import { Seidr } from "../../seidr/seidr";
import { createCaseProxy } from "./case-proxy";

describe("CaseProxy", () => {
  describe("Basic CamelCase to KebabCase mapping", () => {
    test("maps camelCase property access to kebab-case storage", () => {
      const { proxy, storage } = createCaseProxy<any, any>();
      proxy.fooBar = "baz";
      expect(storage["foo-bar"]).toBe("baz");
      expect(proxy.fooBar).toBe("baz");
    });

    test("handles multiple levels of camelCase", () => {
      const { proxy, storage } = createCaseProxy<any, any>();
      proxy.fooBarBaz = "qux";
      expect(storage["foo-bar-baz"]).toBe("qux");
      expect(proxy.fooBarBaz).toBe("qux");
    });
  });

  describe("Prefix handling", () => {
    test("adds prefix to storage keys", () => {
      const { proxy, storage } = createCaseProxy<any, any>({ prefix: "data-" });
      proxy.fooBar = "baz";
      expect(storage["data-foo-bar"]).toBe("baz");
      expect(proxy.fooBar).toBe("baz");
    });

    test("handles property access with prefix already present", () => {
      const { proxy, storage } = createCaseProxy<any, any>({ prefix: "data-" });
      proxy["data-foo-bar"] = "baz";
      expect(storage["data-foo-bar"]).toBe("baz");
    });

    test("dropPrefix: true", () => {
      const { proxy, storage } = createCaseProxy<any, any>({ prefix: "data-", dropPrefix: true });
      storage["data-foo-bar"] = "baz";
      expect(Object.keys(proxy)).toContain("fooBar");
      expect(proxy.fooBar).toBe("baz");
    });
  });

  describe("Special properties", () => {
    test("maps className to class", () => {
      const { proxy, storage } = createCaseProxy<any, any>();
      proxy.className = "my-class";
      expect(storage["class"]).toBe("my-class");
      expect(proxy.className).toBe("my-class");
    });

    test("allows internal properties starting with $ or _", () => {
      const { proxy, storage } = createCaseProxy<any, any>();
      proxy.$foo = "bar";
      proxy._baz = "qux";
      expect(storage["$foo"]).toBe("bar");
      expect(storage["_baz"]).toBe("qux");
    });

    test("allows common non-camel/kebab properties", () => {
      const { proxy } = createCaseProxy<any, any>();
      expect(proxy.constructor).toBeDefined();
      expect(proxy.toJSON).toBeUndefined();
    });

    test("returns special key for invalid properties to avoid crashing Vitest", () => {
      const { proxy } = createCaseProxy<any, any>();
      const val = proxy["Invalid Prop With Spaces"];
      expect(val).toBeUndefined();
    });
  });

  describe("toString serialization", () => {
    test("default serialization", () => {
      const { proxy } = createCaseProxy<any, any>();
      proxy.fooBar = "baz";
      proxy.qux = 123;
      expect(proxy.toString()).toBe('foo-bar="baz" qux="123"');
    });

    test("handles boolean attributes", () => {
      const { proxy } = createCaseProxy<any, any>();
      proxy.disabled = true;
      proxy.hidden = false;
      expect(proxy.toString()).toBe("disabled");
    });

    test("handles reactive values", () => {
      const s = new Seidr("initial");
      const { proxy } = createCaseProxy<any, any>();
      proxy.foo = s;
      expect(proxy.toString()).toBe('foo="initial"');
      s.value = "updated";
      expect(proxy.toString()).toBe('foo="updated"');
    });

    test("custom serialize", () => {
      const { proxy } = createCaseProxy<any, any>({
        serialize: (s) =>
          Object.entries(s)
            .sort()
            .map(([k, v]) => `${k}:${v}`)
            .join(";"),
      });
      proxy.foo = "bar";
      proxy.baz = "qux";
      expect(proxy.toString()).toBe("baz:qux;foo:bar");
    });

    test("custom escapeKeyValue", () => {
      const { proxy } = createCaseProxy<any, any>({
        escapeKeyValue: (_k, v) => `[${v}]`,
      });
      proxy.foo = "bar";
      expect(proxy.toString()).toBe('foo="[bar]"');
    });

    test("skips non-prefixed keys if prefix is set", () => {
      const storage = { "data-foo": "bar", other: "baz" };
      const { proxy } = createCaseProxy<any, any>({ prefix: "data-", storage });
      expect(proxy.toString()).toBe('data-foo="bar"');
    });
  });

  describe("fromString parsing", () => {
    test("throws if no parse function provided", () => {
      const cp = createCaseProxy<any, any>();
      expect(() => cp.fromString("foo")).toThrow("No parse function provided");
    });

    test("custom parse function", () => {
      const { proxy, storage, fromString } = createCaseProxy<any, any>({
        parse: (val) => {
          const parts = val.split(";");
          const obj: any = {};
          parts.forEach((p) => {
            const [k, v] = p.split(":");
            if (k && v) obj[k] = v;
          });
          return obj;
        },
      });
      fromString("color:red;margin:10px");
      expect(storage["color"]).toBe("red");
      expect(storage["margin"]).toBe("10px");
      expect(proxy.color).toBe("red");
    });

    test("clears existing keys with prefix before parsing", () => {
      const storage = { "data-old": "value", other: "keep" } as any;
      const { fromString } = createCaseProxy<any, any>({
        prefix: "data-",
        storage,
        parse: (val) => ({ "data-new": val }),
      });
      fromString("newValue");
      expect(storage["data-old"]).toBeUndefined();
      expect(storage["data-new"]).toBe("newValue");
      expect(storage["other"]).toBe("keep");
    });
  });

  describe("Proxy Traps", () => {
    test("has trap", () => {
      const { proxy } = createCaseProxy<any, any>();
      proxy.fooBar = "baz";
      expect("fooBar" in proxy).toBe(true);
      expect("nonExistent" in proxy).toBe(false);
    });

    test("deleteProperty trap", () => {
      const { proxy, storage } = createCaseProxy<any, any>();
      proxy.fooBar = "baz";
      delete proxy.fooBar;
      expect("foo-bar" in storage).toBe(false);
    });

    test("ownKeys trap", () => {
      const { proxy } = createCaseProxy<any, any>({ prefix: "data-", dropPrefix: true });
      proxy.fooBar = "baz";
      proxy.qux = "quux";
      const keys = Object.keys(proxy);
      expect(keys).toContain("fooBar");
      expect(keys).toContain("qux");
    });

    test("getOwnPropertyDescriptor trap", () => {
      const { proxy } = createCaseProxy<any, any>();
      proxy.fooBar = "baz";
      const desc = Object.getOwnPropertyDescriptor(proxy, "fooBar");
      expect(desc).toBeDefined();
      expect(desc?.value).toBe("baz");
      expect(desc?.enumerable).toBe(true);
    });
  });

  describe("onUpdate callback", () => {
    test("calls onUpdate when property is set", () => {
      const onUpdate = vi.fn();
      const { proxy } = createCaseProxy<any, any>({ onUpdate });
      proxy.fooBar = "baz";
      expect(onUpdate).toHaveBeenCalledWith("foo-bar", "baz");
    });

    test("calls onUpdate when property is deleted", () => {
      const onUpdate = vi.fn();
      const { proxy } = createCaseProxy<any, any>({ onUpdate });
      proxy.fooBar = "baz";
      delete proxy.fooBar;
      expect(onUpdate).toHaveBeenCalledWith("foo-bar", undefined);
    });

    test("calls onUpdate when fromString is called", () => {
      const onUpdate = vi.fn();
      const { fromString } = createCaseProxy<any, any>({
        prefix: "data-",
        onUpdate,
        parse: (v) => ({ "data-foo": v }),
      });
      fromString("test");
      expect(onUpdate).toHaveBeenCalledWith("data-", "test");
    });
  });
});
