import { beforeEach, describe, expect, it } from "vitest";
import "../dom/dom-factory.browser";
import { elementClassToggle } from "../helper";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { isHTMLElement } from "../util/type-guards/dom-node-types";
import { $ } from "./create-element";
import type { SeidrElement } from "./types";

describeDualMode("$ (createElement)", ({ getDOMFactory }) => {
  let document: Document;
  beforeEach(() => {
    document = getDOMFactory().getDocument();
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

describe("elementClassToggle", () => {
  let element: SeidrElement;
  let observable: Seidr<boolean>;

  beforeEach(() => {
    element = $("div");
    observable = new Seidr(false);
  });

  it("should add class when observable is true", () => {
    observable.value = true;

    const cleanup = elementClassToggle(element, "active", observable);

    expect(element.classList.contains("active")).toBe(true);

    cleanup();
  });

  it("should remove class when observable is false", () => {
    observable.value = false;

    const cleanup = elementClassToggle(element, "active", observable);

    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should toggle class when observable changes", () => {
    const cleanup = elementClassToggle(element, "active", observable);

    expect(element.classList.contains("active")).toBe(false);

    observable.value = true;
    expect(element.classList.contains("active")).toBe(true);

    observable.value = false;
    expect(element.classList.contains("active")).toBe(false);

    cleanup();
  });

  it("should return cleanup function", () => {
    const cleanup = elementClassToggle(element, "active", observable);

    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("should stop updating after cleanup", () => {
    const cleanup = elementClassToggle(element, "active", observable);

    expect(element.classList.contains("active")).toBe(false);

    cleanup();

    observable.value = true;

    // Class should not be added after cleanup
    expect(element.classList.contains("active")).toBe(false);
  });

  it("should work with existing classes on element", () => {
    element.classList.add("existing");
    observable.value = true;

    const cleanup = elementClassToggle(element, "active", observable);

    expect(element.classList.contains("existing")).toBe(true);
    expect(element.classList.contains("active")).toBe(true);

    cleanup();

    expect(element.classList.contains("existing")).toBe(true);
    // elementClassToggle cleanup doesn't remove the class, it just stops observing changes
    expect(element.classList.contains("active")).toBe(true);
  });
});
