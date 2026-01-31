import { describe, expect, it } from "vitest";
import { createServerNode } from "./server-node";
import { ELEMENT_NODE } from "./types";
import { nodeWithChildElementNodesExtension } from "./with-child-elements";
import { nodeWithChildNodesExtension } from "./with-child-nodes";

describe("nodeWithChildElementNodesExtension", () => {
  const createBase = (tag = "div") => {
    return nodeWithChildElementNodesExtension(
      nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: tag })),
    );
  };

  const createEl = (tag = "span") => {
    return nodeWithChildElementNodesExtension(
      nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: tag })),
    );
  };

  it("should have element-specific properties", () => {
    const node = createBase();
    expect(node.children).toEqual([]);
    expect(node.childElementCount).toBe(0);
    expect(node.firstElementChild).toBe(null);
    expect(node.lastElementChild).toBe(null);
  });

  it("should track elements in children property", () => {
    const node = createBase();
    const c1 = createEl("c1");
    const text = "some text";
    const c2 = createEl("c2");

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
    const c1 = createEl("c1");
    const c2 = createEl("c2");

    node.append(c1 as any, "text", c2 as any);
    expect(node.childNodes).toHaveLength(3);
    expect(node.children).toEqual([c1, c2]);
  });

  it("should support prepend()", () => {
    const node = createBase();
    const existing = createEl("existing");
    node.appendChild(existing as any);

    const p1 = createEl("p1");
    node.prepend(p1 as any, "text");

    expect(node.childNodes[0]).toBe(p1);
    expect(node.childNodes[1].nodeType).toBe(3); // Text
    expect(node.childNodes[2]).toBe(existing);
  });

  it("should support replaceChildren()", () => {
    const node = createBase();
    node.appendChild(createEl("old"));
    node.appendChild("old text");

    const n1 = createEl("new");
    node.replaceChildren(n1 as any, "new text");

    expect(node.childNodes).toHaveLength(2);
    expect(node.childNodes[0]).toBe(n1);
    expect(node.childNodes[1].textContent).toBe("new text");
  });

  it("should support moveBefore()", () => {
    const node = createBase();
    const c1 = createEl("c1");
    const c2 = createEl("c2");
    const c3 = createEl("c3");

    node.append(c1 as any, c2 as any, c3 as any);
    expect(node.children).toEqual([c1, c2, c3]);

    node.moveBefore(c3 as any, c2 as any);
    expect(node.children).toEqual([c1, c3, c2]);
  });

  describe("Query Methods", () => {
    it("should getElementById", () => {
      const root = createBase();
      const c1 = createEl("div");
      (c1 as any).id = "foo";
      root.appendChild(c1 as any);

      expect(root.getElementById("foo")).toBe(c1);
      expect(root.getElementById("bar")).toBe(null);
    });

    it("should getElementsByTagName", () => {
      const root = createBase();
      const s1 = createEl("span");
      const s2 = createEl("span");
      const d1 = createEl("div");

      root.appendChild(s1 as any);
      root.appendChild(d1 as any);
      root.appendChild(s2 as any);

      expect(root.getElementsByTagName("span")).toEqual([s1, s2]);
      expect(root.getElementsByTagName("div")).toEqual([d1]);
    });

    it("should getElementsByClassName", () => {
      const root = createBase();
      const c1 = createEl("div");
      (c1 as any).className = "foo bar";
      const c2 = createEl("div");
      (c2 as any).className = "bar";

      root.appendChild(c1 as any);
      root.appendChild(c2 as any);

      expect(root.getElementsByClassName("foo")).toEqual([c1]);
      expect(root.getElementsByClassName("bar")).toEqual([c1, c2]);
    });
  });
});
