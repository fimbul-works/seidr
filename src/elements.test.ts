import { describe, expect, it, vi } from "vitest";
import type { SeidrElement } from "./element.js";
import { $a, $button, $div, $input, $span, $text } from "./elements.js";

describe("predefined element creators", () => {
  it("should create elements with correct types", () => {
    const div = $div({ className: "container" });
    const button = $button({ textContent: "Click" });
    const input = $input({ type: "text" });
    const span = $span({ textContent: "Hello" });
    const anchor = $a({ href: "#", textContent: "Link" });

    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("container");

    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Click");

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");

    expect(span.tagName).toBe("SPAN");
    expect(span.textContent).toBe("Hello");

    expect(anchor.tagName).toBe("A");
    expect(anchor.href).toContain("#");
    expect(anchor.textContent).toBe("Link");
  });

  it("should support children arrays", () => {
    const text1 = $text("Hello ");
    const text2 = $text("World");
    const span = $span({}, [text1, text2]);

    expect(span.textContent).toBe("Hello World");
  });

  it("should maintain the on method on predefined creators", () => {
    const button = $button({ textContent: "Click me" });
    const handler = vi.fn();

    expect("on" in button).toBe(true);

    const cleanup = (button as SeidrElement).on("click", handler);

    button.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();
  });
});

describe("$text", () => {
  it("should create text node with given text", () => {
    const textNode = $text("Hello World");

    expect(textNode.nodeType).toBe(3); // TEXT_NODE
    expect(textNode.textContent).toBe("Hello World");
  });

  it("should work with empty string", () => {
    const textNode = $text("");

    expect(textNode.textContent).toBe("");
  });

  it("should work with special characters", () => {
    const textNode = $text("Hello & <World>");

    expect(textNode.textContent).toBe("Hello & <World>");
  });
});
