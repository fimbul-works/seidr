import { expect, it } from "vitest";
import { describeDualMode, mockUseScope } from "../test-setup";
import { assignProps } from "./assign-props";

describeDualMode("assignProps", ({ getDocument }) => {
  mockUseScope();

  it("should assign basic props", () => {
    const factory = getDocument();
    const el = factory.createElement("div");
    assignProps(el, { id: "foo", title: "bar" });
    expect(el.id).toBe("foo");
    expect(el.title).toBe("bar");
  });

  it("should handle custom data attributes", () => {
    const factory = getDocument();
    const el = factory.createElement("div");
    assignProps(el, { "data-custom": "value" });
    expect(el.getAttribute("data-custom")).toBe("value");
  });

  it("should handle style props", () => {
    const factory = getDocument();
    const el = factory.createElement("div");
    assignProps(el, { style: { color: "red", fontSize: "10px" } });
    expect(el.style.color).toBe("red");
    // browsers might return '10px' or '10.0px' depending on engine, but SSR should be exact
    expect(el.style.fontSize).toBe("10px");
  });
});
