import { describe, expect, it, vi } from "vitest";
import { createServerNode } from "./server-node";
import { DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "./types";
import { nodeWithChildrenExtension } from "./with-children";
import { nodeWithParentExtension } from "./with-parent";

describe("nodeWithParentExtension", () => {
  const createParent = (tag = "div") => {
    return nodeWithChildrenExtension(createServerNode(ELEMENT_NODE, { tagName: tag }));
  };

  const createChild = (tag = "span") => {
    return nodeWithParentExtension(createServerNode(ELEMENT_NODE, { tagName: tag }));
  };

  it("should have initial null parent", () => {
    const child = createChild();
    expect(child.parentNode).toBe(null);
    expect(child.parentElement).toBe(null);
  });

  it("should have read-only parentNode", () => {
    const child = createChild();
    const parent = createParent();
    expect(() => {
      (child as any).parentNode = parent;
    }).toThrow();
  });

  it("should update parentNode when parent appends child", () => {
    const parent = createParent();
    const child = createChild();

    parent.appendChild(child as any);
    expect(child.parentNode).toBe(parent);
    expect(child.parentElement).toBe(parent);
  });

  it("should handle sibling navigation", () => {
    const parent = createParent();
    const c1 = createChild("c1");
    const c2 = createChild("c2");
    const c3 = createChild("c3");

    parent.appendChild(c1 as any);
    parent.appendChild(c2 as any);
    parent.appendChild(c3 as any);

    expect(c1.previousSibling).toBe(null);
    expect(c1.nextSibling).toBe(c2);
    expect(c2.previousSibling).toBe(c1);
    expect(c2.nextSibling).toBe(c3);
    expect(c3.previousSibling).toBe(c2);
    expect(c3.nextSibling).toBe(null);
  });

  it("should allow manual removal via remove()", () => {
    const parent = createParent();
    const child = createChild();

    parent.appendChild(child as any);
    expect(parent.childNodes).toContain(child);

    child.remove();
    expect(parent.childNodes).not.toContain(child);
    expect(child.parentNode).toBe(null);
  });

  it("should trigger onAttached and onRemove callbacks", () => {
    const onAttached = vi.fn();
    const onRemove = vi.fn();

    const parent = createParent();
    const child = nodeWithParentExtension(createServerNode(ELEMENT_NODE, { tagName: "span" }), {
      onAttached,
      onRemove,
    });

    parent.appendChild(child as any);
    expect(onAttached).toHaveBeenCalledWith(parent);

    child.remove();
    expect(onRemove).toHaveBeenCalledWith(parent);
  });

  it("should throw when parent is not an element or fragment", () => {
    const textNode = createServerNode(TEXT_NODE);
    const child = createChild();

    expect(() => {
      child.parent = textNode as any;
    }).toThrow("Parent node must be an element or a document fragment");
  });

  it("should handle parentNode assignment via parent", () => {
    const p1 = createParent("p1");
    const p2 = createParent("p2");
    const child = createChild();

    child.parent = p1;
    expect(p1.childNodes).toContain(child);
    expect(child.parentNode).toBe(p1);

    child.parent = p2;
    expect(p1.childNodes).not.toContain(child);
    expect(p2.childNodes).toContain(child);
    expect(child.parentNode).toBe(p2);

    child.parent = null;
    expect(p2.childNodes).not.toContain(child);
    expect(child.parentNode).toBe(null);
  });
});
