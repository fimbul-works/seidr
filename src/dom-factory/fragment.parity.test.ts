import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";

describeDualMode("Fragment Parity", ({ getDOMFactory }) => {
  it("should create document fragment", () => {
    const factory = getDOMFactory();
    const frag = factory.createDocumentFragment();
    expect(frag.nodeType).toBe(11); // DOCUMENT_FRAGMENT_NODE
    expect(frag.nodeName).toBe("#document-fragment");
  });

  it("should have correct ownerDocument", () => {
    const factory = getDOMFactory();
    const frag = factory.createDocumentFragment();
    const doc = factory.getDocument();
    expect(frag.ownerDocument).toBe(doc);
  });

  it("should append children and serialize", () => {
    const factory = getDOMFactory();
    const frag = factory.createDocumentFragment();
    const p = factory.createElement("p");
    p.textContent = "Paragraph";
    const t = factory.createTextNode("Text");

    frag.appendChild(p);
    frag.appendChild(t);

    // To visualize fragment, we usually append it to a container
    const div = factory.createElement("div");
    div.appendChild(frag);

    const html = (div as any).outerHTML || (div as any).toString();
    expect(html).toContain("<p>Paragraph</p>");
    expect(html).toContain("Text");
  });
});
