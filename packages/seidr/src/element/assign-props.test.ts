import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup";
import { assignProps } from "./assign-props";
import { getPropMutators, registerPropMutator } from "./prop-mutators";

describeDualMode("assignProps", ({ getDocument }) => {
  it("should assign basic props", () => {
    const el = getDocument().createElement("div");
    assignProps(el, { id: "foo", title: "bar" });
    expect(el.id).toBe("foo");
    expect(el.title).toBe("bar");
  });

  it("should handle custom data attributes", () => {
    const el = getDocument().createElement("div");
    assignProps(el, { "data-custom": "value", dataTest: "value2" });
    expect(el.getAttribute("data-custom")).toBe("value");
    expect(el.dataset.test).toBe("value2");
  });

  it("should handle style props", () => {
    const el = getDocument().createElement("div");
    assignProps(el, { style: { color: "red", fontSize: "10px" } });
    expect(el.style.color).toBe("red");
    // browsers might return '10px' or '10.0px' depending on engine, but SSR should be exact
    expect(el.style.fontSize).toBe("10px");
  });

  it("should apply prop mutators only when trigger property is present and clean up on unregister", () => {
    const mutatorA = (_el: HTMLElement, props: any) => ({ ...props, dataMutatedA: "1" });
    const mutatorB = (_el: HTMLElement, props: any) => ({ ...props, dataMutatedB: "2" });

    const unregisterA = registerPropMutator("dataTrigger", mutatorA);
    // Duplicate registration should be ignored
    registerPropMutator("dataTrigger", mutatorA);
    const unregisterB = registerPropMutator("dataTrigger", mutatorB);

    expect(getPropMutators("dataTrigger")).toEqual([mutatorA, mutatorB]);

    const withoutTrigger = getDocument().createElement("div");
    assignProps(withoutTrigger, { id: "plain" });
    expect(withoutTrigger.hasAttribute("data-mutated-a")).toBe(false);
    expect(withoutTrigger.hasAttribute("data-mutated-b")).toBe(false);

    const withTrigger = getDocument().createElement("div");
    assignProps(withTrigger, { dataTrigger: "yes" });
    expect(withTrigger.getAttribute("data-mutated-a")).toBe("1");
    expect(withTrigger.getAttribute("data-mutated-b")).toBe("2");

    unregisterA();
    expect(getPropMutators("dataTrigger")).toEqual([mutatorB]);

    unregisterB();
    expect(getPropMutators("dataTrigger")).toEqual([]);
  });
});
