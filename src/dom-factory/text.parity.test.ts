import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";

describeDualMode("Text Parity", ({ getDOMFactory }) => {
  it("should create text node", () => {
    const factory = getDOMFactory();
    const text = factory.createTextNode("Hello");
    expect(text.textContent).toBe("Hello");
    expect(text.nodeType).toBe(3); // TEXT_NODE
    expect(text.nodeName).toBe("#text");
  });

  it("should have correct ownerDocument", () => {
    const factory = getDOMFactory();
    const text = factory.createTextNode("World");
    const doc = factory.getDocument();
    expect(text.ownerDocument).toBe(doc);
  });

  it("should serialize correctly", () => {
    const factory = getDOMFactory();
    const text = factory.createTextNode("Hello & World");

    // In Browser, Text nodes don't have outerHTML. We check nodeValue or append to container.
    // In SSR, toString() returns escaped text.
    // To compare, we append to a div.
    const div = factory.createElement("div");
    div.appendChild(text);

    // Check HTML string of parent
    // SSR has toString(), Browser has outerHTML
    const html = (div as any).outerHTML || (div as any).toString();
    expect(html).toContain("Hello &amp; World");
  });
});
