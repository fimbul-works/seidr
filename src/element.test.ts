import { describe, expect, it, vi } from "vitest";
import { createElement, type SeidrElement } from "./element.js";

describe("createElement", () => {
  it("should create basic HTML element", () => {
    const div = createElement("div");

    expect(div.tagName).toBe("DIV");
    expect(div instanceof HTMLElement).toBe(true);
  });

  it("should assign properties to element", () => {
    const div = createElement("div", {
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
    const div = createElement("div", {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);
  });

  it("should add on method to element", () => {
    const div = createElement("div");

    expect("on" in div).toBe(true);
    expect(typeof (div as any).on).toBe("function");
  });

  it("should work with different HTML elements", () => {
    const button = createElement("button", { type: "button", textContent: "Click me" });
    const input = createElement("input", { type: "text", placeholder: "Enter text" });
    const anchor = createElement("a", { href: "#", textContent: "Link" });

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

describe("element on method", () => {
  it("should provide on method on created elements", () => {
    const div = createElement("div");
    const handler = vi.fn();

    expect("on" in div).toBe(true);

    // TypeScript should infer the correct types
    const cleanup = (div as SeidrElement).on("click", handler);

    expect(typeof cleanup).toBe("function");

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
