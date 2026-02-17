import { describe, expect, it, vi } from "vitest";
import { weave } from "./seidr-weave";

describe("Weave", () => {
  it("should give access to an object", () => {
    const v = weave({ name: "foo" });
    expect(v.name).toBe("foo");
    v.name = "bar";
    expect(v.name).toBe("bar");
  });

  it("should be observable", () => {
    const v = weave({ name: "foo" });
    const listener = vi.fn();
    const cleanup = v.observe(listener);

    v.name = "bar";
    expect(listener).toHaveBeenCalledWith({ name: "bar" });
    cleanup();

    v.name = "baz";
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should be reactive", () => {
    const v = weave({ name: "foo" });
    const target = { name: "" };

    const listener = vi.fn();
    const cleanup = v.bind(target, (v, t) => ((t.name = v.name), listener(v)));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(v);
    expect(target.name).toBe("foo");

    v.name = "bar";
    expect(listener).toHaveBeenCalledTimes(2);
    expect(target.name).toBe("bar");
    cleanup();

    v.name = "baz";
    expect(listener).toHaveBeenCalledTimes(2);
    expect(target.name).toBe("bar");
  });

  it("should support nested keys", () => {
    const v = weave({ name: { first: "foo" } });

    expect(v.name).toBeTypeOf("object");
    expect(v.name.first).toBeTypeOf("string");
    expect(v.name.first).toBe("foo");

    const listener = vi.fn();
    const cleanup = v.observe(listener);

    v.name.first = "bar";
    expect(v.name.first).toBe("bar");
    expect(listener).toHaveBeenCalledTimes(1);
    cleanup();

    const childListener = vi.fn();
    const childCleanup = v.name.observe(childListener);

    v.name.first = "baz";
    expect(v.name.first).toBe("baz");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);

    childCleanup();

    v.name.first = "qux";
    expect(listener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);
  });
});
