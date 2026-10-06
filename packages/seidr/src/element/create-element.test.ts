import { expect } from "vitest";
import { $text } from "../dom";
import { isHTMLElement } from "../dom/type-guards";
import { describeDualMode, itHasParity } from "../test-setup";
import { $ } from "./create-element";

describeDualMode("$ (createElement)", () => {
  itHasParity("should create basic HTML element", () => {
    const div = $("div");

    expect(div.tagName).toBe("DIV");
    expect(isHTMLElement(div)).toBe(true);

    return div;
  });

  itHasParity("should assign properties to element", () => {
    const div = $("div", {
      id: "test-id",
      className: "test-class",
      textContent: "Hello World",
    });

    expect(div.id).toBe("test-id");
    expect(div.className).toBe("test-class");
    expect(div.textContent).toBe("Hello World");

    return div;
  });

  itHasParity("should append children to element", () => {
    const child1 = $("span");
    const child2 = $text("text");
    const div = $("div", {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);

    return div;
  });

  itHasParity("should work with different HTML elements", () => {
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

    return $("div", [button, input, anchor]);
  });

  itHasParity("should support defining children directly as 2nd parameter without props", () => {
    const div1 = $("div", "Hello Direct Child");
    expect(div1.textContent).toBe("Hello Direct Child");

    const span = $("span");
    span.textContent = "Inner";
    const div2 = $("div", span);
    expect(div2.children[0]).toBe(span);

    const div3 = $("div", [$("span"), "text"]);
    expect(div3.childNodes.length).toBe(2);

    return $("div", [div1, div2, div3]);
  });
});
