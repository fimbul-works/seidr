import { beforeEach, expect, it } from "vitest";
import "../dom/get-document.browser";
import { describeDualMode, mockUseScope } from "../test-setup";
import { isHTMLElement } from "../util/type-guards/dom-node-types";
import { $ } from "./create-element";

describeDualMode("$ (createElement)", ({ getDocument }) => {
  let document: Document;

  mockUseScope();

  beforeEach(() => {
    document = getDocument();
  });

  it("should create basic HTML element", () => {
    const div = $("div");

    expect(div.tagName).toBe("DIV");
    expect(isHTMLElement(div)).toBe(true);
  });

  it("should assign properties to element", () => {
    const div = $("div", {
      id: "test-id",
      className: "test-class",
      textContent: "Hello World",
    });

    expect(div.id).toBe("test-id");
    expect(div.className).toBe("test-class");
    expect(div.textContent).toBe("Hello World");
  });

  it("should append children to element", () => {
    const child1 = document.createElement("span");
    const child2 = document.createTextNode("text");
    const div = $("div", {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);
  });

  it("should work with different HTML elements", () => {
    const button = $("button", { type: "button", textContent: "Click me" });
    const input = $("input", { type: "text", placeholder: "Enter text" });
    const anchor = $("a", { href: "#", textContent: "Link" });

    expect(button.tagName).toBe("BUTTON");
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Click me");

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");
    expect(input.placeholder).toBe("Enter text");

    expect(anchor.tagName).toBe("A");
    expect(anchor.href).toContain("#");
    expect(anchor.textContent).toBe("Link");
  });
});
