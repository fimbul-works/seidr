import { describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { createStyleProxy } from "./style-proxy";

describe("StyleProxy", () => {
  it("should map camelCase to kebab-case without prefix", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createStyleProxy({ storage });

    proxy.backgroundColor = "red";
    expect(storage["background-color"]).toBe("red");
    expect(proxy.backgroundColor).toBe("red");
  });

  it("should support kebab-case keys", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createStyleProxy({ storage });

    proxy["font-size"] = "12px";
    expect(storage["font-size"]).toBe("12px");
    expect(proxy.fontSize).toBe("12px");
  });

  it("should NOT unwrap Seidr values in the getter", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createStyleProxy({ storage });
    const s = new Seidr("100px");

    proxy.width = s;
    expect(proxy.width).toBe(s);
  });

  it("should support CSSStyleDeclaration methods", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createStyleProxy({ storage });

    proxy.setProperty("color", "blue");
    expect(storage["color"]).toBe("blue");
    expect(proxy.getPropertyValue("color")).toBe("blue");

    proxy.removeProperty("color");
    expect(storage["color"]).toBeUndefined();
  });

  it("should support toString with Seidr unwrapping", () => {
    const storage: Record<string, any> = {};
    const { proxy } = createStyleProxy({ storage });
    const color = new Seidr("red");

    proxy.color = color;
    proxy.display = "flex";

    expect(proxy.toString()).toBe("color:red;display:flex;");

    color.value = "blue";
    expect(proxy.toString()).toBe("color:blue;display:flex;");
  });

  it("should support fromString through parse", () => {
    const storage: Record<string, any> = {};
    const { fromString, proxy } = createStyleProxy({ storage });

    fromString("margin-top: 10px; padding: 5px");
    expect(storage["margin-top"]).toBe("10px");
    expect(storage["padding"]).toBe("5px");
    expect(proxy.marginTop).toBe("10px");
  });
});
