import { describe, expect, it, vi } from "vitest";
import { createServerNode } from "./server-node";
import { DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "./types";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithParentExtension } from "./with-parent";

describe("nodeWithChildNodesExtension", () => {
  const createBase = () => {
    const node = createServerNode(ELEMENT_NODE, { tagName: "div" });
    return nodeWithChildNodesExtension(node);
  };

  const createChild = (tag = "span") => {
    return nodeWithParentExtension(createServerNode(ELEMENT_NODE, { tagName: tag }));
  };

  it("should initialize with empty childNodes", () => {
    const node = createBase();
    expect(node.childNodes).toEqual([]);
    expect(node.firstChild).toBe(null);
    expect(node.lastChild).toBe(null);
    expect(node.hasChildNodes()).toBe(false);
  });

  it("should append child nodes (Element and Text)", () => {
    const node = createBase();
    const child = createChild();

    node.appendChild(child as any);
    expect(node.childNodes).toHaveLength(1);
    expect(node.childNodes[0]).toBe(child);
    expect(node.firstChild).toBe(child);
    expect(node.lastChild).toBe(child);
    expect(node.hasChildNodes()).toBe(true);

    node.appendChild("text");
    expect(node.childNodes).toHaveLength(2);
    expect(node.childNodes[1].nodeType).toBe(TEXT_NODE);
    expect(node.childNodes[1].textContent).toBe("text");
  });

  it("should handle DocumentFragment in appendChild", () => {
    const node = createBase();
    const fragment = nodeWithChildNodesExtension(createServerNode(DOCUMENT_FRAGMENT_NODE));
    const c1 = createChild("c1");
    const c2 = createChild("c2");

    fragment.appendChild(c1 as any);
    fragment.appendChild(c2 as any);

    node.appendChild(fragment as any);
    expect(node.childNodes).toHaveLength(2);
    expect(node.childNodes[0]).toBe(c1);
    expect(node.childNodes[1]).toBe(c2);
    expect(fragment.childNodes).toHaveLength(0); // DocumentFragment is cleared after move
  });

  it("should remove child nodes", () => {
    const node = createBase();
    const child = createChild();
    node.appendChild(child as any);

    node.removeChild(child as any);
    expect(node.childNodes).toHaveLength(0);
    expect(child.parentNode).toBe(null);
  });

  it("should support insertBefore", () => {
    const node = createBase();
    const c1 = createChild("c1");
    const c3 = createChild("c3");
    const c2 = createChild("c2");

    node.appendChild(c1 as any);
    node.appendChild(c3 as any);

    node.insertBefore(c2 as any, c3 as any);
    expect(node.childNodes).toEqual([c1, c2, c3]);
  });

  it("should handle DocumentFragment in insertBefore", () => {
    const node = createBase();
    const fragment = nodeWithChildNodesExtension(createServerNode(DOCUMENT_FRAGMENT_NODE));
    const f1 = createChild("f1");
    const f2 = createChild("f2");
    fragment.appendChild(f1 as any);
    fragment.appendChild(f2 as any);

    const ref = createChild("ref");
    node.appendChild(ref as any);

    node.insertBefore(fragment as any, ref as any);
    expect(node.childNodes).toEqual([f1, f2, ref]);
    expect(fragment.childNodes).toHaveLength(0);
  });

  it("should support contains (recursive)", () => {
    const root = createBase();
    const level1 = createChild("level1");
    const level2 = createChild("level2");

    // We need to add childNodes capability to level1 to test recursion
    const level1WithChildren = nodeWithChildNodesExtension(level1 as any);

    root.appendChild(level1WithChildren as any);
    level1WithChildren.appendChild(level2 as any);

    expect(root.contains(level1WithChildren as any)).toBe(true);
    expect(root.contains(level2 as any)).toBe(true);
    expect(level1WithChildren.contains(level2 as any)).toBe(true);
    expect(root.contains(createChild() as any)).toBe(false);
  });

  it("should move existing child to end when appended again", () => {
    const node = createBase();
    const c1 = createChild("c1");
    const c2 = createChild("c2");

    node.appendChild(c1 as any);
    node.appendChild(c2 as any);
    expect(node.childNodes).toEqual([c1, c2]);

    node.appendChild(c1 as any);
    expect(node.childNodes).toEqual([c2, c1]);
  });

  it("should support replaceChild", () => {
    const node = createBase();
    const oldChild = createChild("old");
    const newChild = createChild("new");

    node.appendChild(oldChild as any);
    node.replaceChild(newChild as any, oldChild as any);

    expect(node.childNodes).toEqual([newChild]);
    expect(oldChild.parentNode).toBe(null);
    expect(newChild.parentNode).toBe(node);
  });
});
