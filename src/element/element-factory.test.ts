import { describe, expect, it } from "vitest";
import { mockComponentScope } from "../test-setup";
import { $ } from "./create-element";
import { $factory } from "./element-factory";

describe("elementFactory", () => {
  mockComponentScope();

  it("should return a function that creates elements", () => {
    const createDiv = $factory("div");
    const div = createDiv({ className: "test" });

    expect(typeof createDiv).toBe("function");
    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("test");
  });

  it("should create specialized element creators", () => {
    const createInput = $factory("input");
    const createButton = $factory("button");

    const input = createInput({ type: "number", value: "42" });
    const button = createButton({ textContent: "Submit" });

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("number");
    expect(input.value).toBe("42");

    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Submit");
  });

  it("should handle optional parameters correctly", () => {
    const createDiv = $factory("div");

    // No parameters
    const div1 = createDiv();
    expect(div1.tagName).toBe("DIV");

    // Only props
    const div2 = createDiv({ id: "test" });
    expect(div2.id).toBe("test");

    // Props and children
    const child = $("span");
    const div3 = createDiv({ id: "parent" }, [child]);
    expect(div3.id).toBe("parent");
    expect(div3.contains(child)).toBe(true);

    // Direct children without props
    const div4 = createDiv("Direct String Child");
    expect(div4.textContent).toBe("Direct String Child");

    const div5 = createDiv([$("span", { textContent: "1" }), $("span", { textContent: "2" })]);
    expect(div5.children.length).toBe(2);
    expect(div5.textContent).toBe("12");
  });
});
