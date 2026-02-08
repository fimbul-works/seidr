import { expect } from "vitest";
import { TYPE_TEXT_NODE } from "../constants";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";

describeDualMode("Text Parity", ({ getDOMFactory }) => {
  itHasParity("should create text node", () => {
    const doc = getDOMFactory().getDocument();
    const text = doc.createTextNode("Hello");
    expect(text.textContent).toBe("Hello");
    expect(text.nodeType).toBe(TYPE_TEXT_NODE);
    expect(text.nodeName).toBe("#text");
    expect(text.ownerDocument).toBe(doc);
    return text;
  });

  itHasParity("should serialize correctly", () => {
    return getDOMFactory().createTextNode("Hello & World");
  });
});
