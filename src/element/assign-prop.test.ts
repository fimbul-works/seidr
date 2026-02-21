import { expect, it } from "vitest";
import { Seidr } from "../seidr/seidr";
import { describeDualMode } from "../test-setup/dual-mode";
import { assignProp } from "./assign-prop";

describeDualMode("assignProp", ({ getDOMFactory }) => {
  it("should assign static properties", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    assignProp(el, "id", "test", cleanups);
    expect(el.id).toBe("test");
    expect(cleanups.length).toBe(0);
  });

  it("should bind reactive properties", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    const obs = new Seidr("initial");
    assignProp(el, "id", obs, cleanups);
    expect(el.id).toBe("initial");
    expect(cleanups.length).toBe(1);

    obs.value = "updated";
    expect(el.id).toBe("updated");
  });

  it("should handle style as string", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    assignProp(el, "style", "color: red;", cleanups);
    expect(el.style.color).toBe("red");
  });

  it("should handle style as object", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    assignProp(el, "style", { color: "blue", fontSize: "10px" }, cleanups);
    expect(el.style.color).toBe("blue");
    expect(el.style.fontSize).toBe("10px");
  });

  it("should handle reactive style object properties", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    const color = new Seidr("red");
    assignProp(el, "style", { color }, cleanups);
    expect(el.style.color).toBe("red");

    color.value = "green";
    expect(el.style.color).toBe("green");
  });

  it("should handle data attributes", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    assignProp(el, "dataTest", "value", cleanups);
    expect(el.dataset.test).toBe("value");
  });

  it("should handle aria attributes", () => {
    const el = getDOMFactory().createElement("div");
    const cleanups: any[] = [];
    assignProp(el, "ariaLabel", "label", cleanups);
    expect(el.getAttribute("aria-label")).toBe("label");
  });
});
