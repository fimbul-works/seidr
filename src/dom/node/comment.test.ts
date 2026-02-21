import { expect } from "vitest";
import { TYPE_COMMENT_NODE } from "../../constants";
import { describeDualMode } from "../../test-setup";
import { itHasParity } from "../../test-setup/dual-mode";

describeDualMode("Comment Parity", ({ getDocument }) => {
  itHasParity("should create comment node", () => {
    const doc = getDocument();
    const comment = doc.createComment("my comment");
    expect(comment.textContent).toBe("my comment");
    expect(comment.nodeType).toBe(TYPE_COMMENT_NODE);
    expect(comment.nodeName).toBe("#comment");
    expect(comment.ownerDocument).toBe(doc);
    return comment;
  });

  itHasParity("should serialize correctly", () => {
    const comment = getDocument().createComment("hidden info");
    return comment;
  });
});
