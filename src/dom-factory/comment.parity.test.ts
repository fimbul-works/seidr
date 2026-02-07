import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";
import { COMMENT_NODE } from "../types";

describeDualMode("Comment Parity", ({ getDOMFactory }) => {
  it("should create comment node", () => {
    const factory = getDOMFactory();
    const comment = factory.createComment("my comment");
    expect(comment.textContent).toBe("my comment");
    expect(comment.nodeType).toBe(COMMENT_NODE);
    expect(comment.nodeName).toBe("#comment");
  });

  it("should have correct ownerDocument", () => {
    const factory = getDOMFactory();
    const comment = factory.createComment("test");
    const doc = factory.getDocument();
    expect(comment.ownerDocument).toBe(doc);
  });

  it("should serialize correctly", () => {
    const factory = getDOMFactory();
    const comment = factory.createComment("hidden info");

    const div = factory.createElement("div");
    div.appendChild(comment);

    const html = (div as any).outerHTML || (div as any).toString();
    expect(html).toContain("<!--hidden info-->");
  });
});
