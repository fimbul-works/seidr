import { describe, expect, it, vi } from "vitest";
import { createServerNode } from "./server-node";
import { DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "./types";
import { nodeWithChildrenExtension } from "./with-children";
import { nodeWithParentExtension } from "./with-parent";

describe("nodeWithChildrenExtension", () => {
  const createBase = (tag = "div") => {
    const node = createServerNode(ELEMENT_NODE, { tagName: tag });
    return nodeWithChildrenExtension(node);
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
    const fragment = nodeWithChildrenExtension(createServerNode(DOCUMENT_FRAGMENT_NODE));
    const c1 = createChild("c1");
    const c2 = createChild("c2");

    fragment.appendChild(c1 as any);
    fragment.appendChild(c2 as any);

    node.appendChild(fragment as any);
    expect(node.childNodes).toHaveLength(2);
    expect(node.childNodes[0]).toBe(c1);
    expect(node.childNodes[1]).toBe(c2);
    // Note: SSR DocumentFragment doesn't necessarily clear nodes unless we want to follow MDN strictly.
    // In our implementation, we move them.
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

  it("should support contains (recursive)", () => {
    const root = createBase();
    const level1 = createChild("level1");
    const level2 = createChild("level2");

    const level1WithChildren = nodeWithChildrenExtension(level1 as any);
    root.appendChild(level1WithChildren as any);
    level1WithChildren.appendChild(level2 as any);

    expect(root.contains(level1WithChildren as any)).toBe(true);
    expect(root.contains(level2 as any)).toBe(true);
    expect(level1WithChildren.contains(level2 as any)).toBe(true);
    expect(root.contains(createChild() as any)).toBe(false);
  });

  it("should have element-specific properties", () => {
    const node = createBase();
    expect(node.children).toEqual([]);
    expect(node.childElementCount).toBe(0);
    expect(node.firstElementChild).toBe(null);
    expect(node.lastElementChild).toBe(null);
  });

  it("should track elements in children property", () => {
    const node = createBase();
    const c1 = createChild("c1");
    const text = "some text";
    const c2 = createChild("c2");

    node.appendChild(c1 as any);
    node.appendChild(text as any);
    node.appendChild(c2 as any);

    expect(node.childNodes).toHaveLength(3);
    expect(node.children).toHaveLength(2);
    expect(node.children).toEqual([c1, c2]);
    expect(node.childElementCount).toBe(2);
    expect(node.firstElementChild).toBe(c1);
    expect(node.lastElementChild).toBe(c2);
  });

  it("should support append() with multiple items", () => {
    const node = createBase();
    const c1 = createChild("c1");
    const c2 = createChild("c2");

    node.append(c1 as any, "text", c2 as any);
    expect(node.childNodes).toHaveLength(3);
    expect(node.children).toEqual([c1, c2]);
  });

  it("should support prepend()", () => {
    const node = createBase();
    const existing = createChild("existing");
    node.appendChild(existing as any);

    const p1 = createChild("p1");
    node.prepend(p1 as any, "text");

    expect(node.childNodes[0]).toBe(p1);
    expect(node.childNodes[1].nodeType).toBe(TEXT_NODE);
    expect(node.childNodes[2]).toBe(existing);
  });

  it("should support replaceChildren()", () => {
    const node = createBase();
    node.appendChild(createChild("old"));
    node.appendChild("old text");

    const n1 = createChild("new");
    node.replaceChildren(n1 as any, "new text");

    expect(node.childNodes).toHaveLength(2);
    expect(node.childNodes[0]).toBe(n1);
    expect(node.childNodes[1].textContent).toBe("new text");
  });

  it("should support moveBefore()", () => {
    const node = createBase();
    const c1 = createChild("c1");
    const c2 = createChild("c2");
    const c3 = createChild("c3");

    node.append(c1 as any, c2 as any, c3 as any);
    expect(node.children).toEqual([c1, c2, c3]);

    node.moveBefore(c3 as any, c2 as any);
    expect(node.children).toEqual([c1, c3, c2]);
  });

  describe("Query Methods", () => {
    it("should getElementById", () => {
      const root = createBase();
      const c1 = createChild("div");
      (c1 as any).id = "foo";
      root.appendChild(c1 as any);

      expect(root.getElementById("foo")).toBe(c1);
      expect(root.getElementById("bar")).toBe(null);
    });

    it("should getElementsByTagName", () => {
      const root = createBase();
      const s1 = createChild("span");
      const s2 = createChild("span");
      const d1 = createChild("div");

      root.appendChild(s1 as any);
      root.appendChild(d1 as any);
      root.appendChild(s2 as any);

      expect(root.getElementsByTagName("span")).toEqual([s1, s2]);
      expect(root.getElementsByTagName("div")).toEqual([d1]);
    });

    it("should getElementsByClassName", () => {
      const root = createBase();
      const c1 = createChild("div");
      (c1 as any).className = "foo bar";
      const c2 = createChild("div");
      (c2 as any).className = "bar";

      root.appendChild(c1 as any);
      root.appendChild(c2 as any);

      expect(root.getElementsByClassName("foo")).toEqual([c1]);
      expect(root.getElementsByClassName("bar")).toEqual([c1, c2]);
    });
  });

  describe("Marker Awareness", () => {
    it("should operate on live range if markers are present", () => {
      const parent = createBase("parent");
      const start = nodeWithParentExtension(createServerNode(8, { nodeValue: "s:test" }));
      const end = nodeWithParentExtension(createServerNode(8, { nodeValue: "e:test" }));
      parent.append(start as any, end as any);

      const extension = {
        start,
        end,
        get parentNode() {
          return start.parentNode;
        },
      };
      nodeWithChildrenExtension(extension as any);

      const child = createChild("range-child");
      (extension as any).appendChild(child);

      expect(parent.childNodes).toEqual([start, child, end]);
      expect((extension as any).childNodes).toEqual([child]);
    });

    it("should remove from live range", () => {
      const parent = createBase("parent");
      const start = nodeWithParentExtension(createServerNode(8, { nodeValue: "s:test" }));
      const end = nodeWithParentExtension(createServerNode(8, { nodeValue: "e:test" }));
      const child = createChild("child");
      parent.append(start as any, child as any, end as any);

      const extension = {
        start,
        end,
        get parentNode() {
          return start.parentNode;
        },
      };
      nodeWithChildrenExtension(extension as any);

      expect((extension as any).childNodes).toEqual([child]);
      (extension as any).removeChild(child);

      expect(parent.childNodes).toEqual([start, end]);
      expect((extension as any).childNodes).toHaveLength(0);
    });
  });
});
