import { expect, it } from "vitest";
import { Seidr } from "../seidr/seidr";
import { describeDualMode, mockUseScope } from "../test-setup/dual-mode";
import { assignProp } from "./assign-prop";

describeDualMode("assignProp", ({ getDocument }) => {
  mockUseScope();

  it("should assign static properties", () => {
    const el = getDocument().createElement("div");
    assignProp(el, "id", "test");
    expect(el.id).toBe("test");
  });

  it("should bind reactive properties", () => {
    const el = getDocument().createElement("div");
    const obs = new Seidr("initial");
    assignProp(el, "id", obs);
    expect(el.id).toBe("initial");

    obs.value = "updated";
    expect(el.id).toBe("updated");
  });

  it("should handle style as string", () => {
    const el = getDocument().createElement("div");
    assignProp(el, "style", "color: red;");
    expect(el.style.color).toBe("red");
  });

  it("should handle style as object", () => {
    const el = getDocument().createElement("div");
    assignProp(el, "style", { color: "blue", fontSize: "10px" });
    expect(el.style.color).toBe("blue");
    expect(el.style.fontSize).toBe("10px");
  });

  it("should handle reactive style object properties", () => {
    const el = getDocument().createElement("div");
    const color = new Seidr("red");
    assignProp(el, "style", { color });
    expect(el.style.color).toBe("red");

    color.value = "green";
    expect(el.style.color).toBe("green");
  });

  it("should handle data attributes", () => {
    const el = getDocument().createElement("div");
    assignProp(el, "dataTest", "value");
    assignProp(el, "data-custom", "value2");
    expect(el.dataset.test).toBe("value");
    expect(el.dataset.custom).toBe("value2");
  });

  it("should handle aria attributes", () => {
    const el = getDocument().createElement("div");
    assignProp(el, "ariaLabel", "label");
    expect(el.getAttribute("aria-label")).toBe("label");
  });
});
