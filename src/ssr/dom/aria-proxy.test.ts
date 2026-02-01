import { describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { createAriaProxy } from "./aria-proxy";

describe("AriaProxy", () => {
  it("should map camelCase to kebab-case with aria- prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createAriaProxy(storage);

    proxy.ariaLabel = "Close";
    expect(storage["aria-label"]).toBe("Close");
    expect(proxy.ariaLabel).toBe("Close");
  });

  it("should support kebab-case keys with aria- prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createAriaProxy(storage);

    proxy["aria-expanded"] = "true";
    expect(storage["aria-expanded"]).toBe("true");
    expect(proxy.ariaExpanded).toBe("true");
  });

  it("should NOT unwrap Seidr values in the getter", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createAriaProxy(storage);
    const s = new Seidr("true");

    proxy.ariaHidden = s;
    expect(proxy.ariaHidden).toBe(s);
  });

  it("should NOT drop 'aria-' prefix for ownKeys", () => {
    const storage = {
      "aria-label": "test",
      "aria-hidden": "true",
      other: "non-aria",
    };
    const { proxy } = createAriaProxy(storage);

    // ARIAMixin properties include the 'aria' prefix
    expect(Object.keys(proxy)).toEqual(["ariaLabel", "ariaHidden"]);
  });
});
