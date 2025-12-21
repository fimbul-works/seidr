import { describe, expect, it } from "vitest";
import { elementFactory } from "./element-factory.js";

describe("elementFactory", () => {
  it("should return a function that creates elements", () => {
    const createDiv = elementFactory("div");
    const div = createDiv({ className: "test" });

    expect(typeof createDiv).toBe("function");
    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("test");
  });

  it("should create specialized element creators", () => {
    const createInput = elementFactory("input");
    const createButton = elementFactory("button");

    const input = createInput({ type: "number", value: "42" });
    const button = createButton({ textContent: "Submit" });

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("number");
    expect(input.value).toBe("42");

    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Submit");
  });

  it("should handle optional parameters correctly", () => {
    const createDiv = elementFactory("div");

    // No parameters
    const div1 = createDiv();
    expect(div1.tagName).toBe("DIV");

    // Only props
    const div2 = createDiv({ id: "test" });
    expect(div2.id).toBe("test");

    // Props and children
    const child = document.createElement("span");
    const div3 = createDiv({ id: "parent" }, [child]);
    expect(div3.id).toBe("parent");
    expect(div3.contains(child)).toBe(true);
  });
});
