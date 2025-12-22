import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type SeidrElement } from "./element.js";
import { Seidr } from "./seidr.js";

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

  describe("toggleClass", () => {
    let element: SeidrElement;
    let observable: Seidr<boolean>;

    beforeEach(() => {
      element = createElement("div");
      observable = new Seidr(false);
    });

    it("should add class when observable is true", () => {
      observable.value = true;

      const cleanup = element.toggleClass("active", observable);

      expect(element.classList.contains("active")).toBe(true);

      cleanup();
    });

    it("should remove class when observable is false", () => {
      observable.value = false;

      const cleanup = element.toggleClass("active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();
    });

    it("should toggle class when observable changes", () => {
      const cleanup = element.toggleClass("active", observable);

      expect(element.classList.contains("active")).toBe(false);

      observable.value = true;

      expect(element.classList.contains("active")).toBe(true);

      observable.value = false;

      expect(element.classList.contains("active")).toBe(false);

      cleanup();
    });

    it("should return cleanup function", () => {
      const cleanup = element.toggleClass("active", observable);

      expect(typeof cleanup).toBe("function");
      expect(() => cleanup()).not.toThrow();
    });

    it("should stop updating after cleanup", () => {
      const cleanup = element.toggleClass("active", observable);

      expect(element.classList.contains("active")).toBe(false);

      cleanup();

      observable.value = true;

      // Class should not be added after cleanup
      expect(element.classList.contains("active")).toBe(false);
    });

    it("should work with existing classes on element", () => {
      element.classList.add("existing");
      observable.value = true;

      const cleanup = element.toggleClass("active", observable);

      expect(element.classList.contains("existing")).toBe(true);
      expect(element.classList.contains("active")).toBe(true);

      cleanup();

      expect(element.classList.contains("existing")).toBe(true);
      // toggleClass cleanup doesn't remove the class, it just stops observing changes
      expect(element.classList.contains("active")).toBe(true);
    });
  });
});
