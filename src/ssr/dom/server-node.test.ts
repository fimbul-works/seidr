import { describe, expect, it } from "vitest";
import { createServerNode } from "./server-node";
import { COMMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "./types";

describe("createServerNode", () => {
  it("should create a node with correct properties", () => {
    const node = createServerNode(ELEMENT_NODE, { tagName: "DIV" });
    expect(node.nodeType).toBe(ELEMENT_NODE);
    expect(node.nodeName).toBe("DIV");
    expect(node.nodeValue).toBe(null);
  });

  it("should handle text nodes", () => {
    const node = createServerNode(TEXT_NODE);
    expect(node.nodeType).toBe(TEXT_NODE);
    expect(node.nodeName).toBe("#text");
  });

  it("should handle comment nodes", () => {
    const node = createServerNode(COMMENT_NODE);
    expect(node.nodeType).toBe(COMMENT_NODE);
    expect(node.nodeName).toBe("#comment");
  });

  it("should allow extending with an object", () => {
    const extra = { customProp: "value", method: () => "result" };
    const node = createServerNode(ELEMENT_NODE, { tagName: "DIV" }, extra) as any;

    expect(node.customProp).toBe("value");
    expect(node.method()).toBe("result");
  });

  it("should allow extending with a function", () => {
    const extension = (n: any) => ({
      get uppercaseTag() {
        return n.tagName.toUpperCase();
      },
    });

    const node = createServerNode(ELEMENT_NODE, { tagName: "div" }, extension);
    expect(node.uppercaseTag).toBe("DIV");
  });

  it("should maintain getter/setter behavior when extending with object descriptors", () => {
    let internalValue = "init";
    const extension = {
      get reactiveProp() {
        return internalValue;
      },
      set reactiveProp(v: string) {
        internalValue = v;
      },
    };

    const node = createServerNode(ELEMENT_NODE, { tagName: "DIV" }, extension) as any;

    expect(node.reactiveProp).toBe("init");
    node.reactiveProp = "changed";
    expect(internalValue).toBe("changed");
    expect(node.reactiveProp).toBe("changed");
  });

  it("should pass the current state of the node to extension functions", () => {
    const ext1 = { a: 1 };
    const ext2 = (n: any) => ({
      b: n.a + 1,
    });

    const node = createServerNode(ELEMENT_NODE, { tagName: "DIV" }, ext1, ext2);
    expect(node.a).toBe(1);
    expect(node.b).toBe(2);
  });

  it("should throw for invalid extensions", () => {
    expect(() => createServerNode(ELEMENT_NODE, { tagName: "DIV" }, "invalid" as any)).toThrow(
      "Extension must be a function or an object",
    );
  });
});
