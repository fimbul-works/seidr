import { describe, expect, it } from "vitest";
import { createCommentNode, createTextNode } from "./character-data";
import { createServerNode } from "./server-node";
import { ELEMENT_NODE } from "./types";
import { nodeWithChildElementNodesExtension } from "./with-child-elements";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithElementPropertiesExtension } from "./with-element-properties";
import { nodeWithParentExtension } from "./with-parent";

describe("Modular SSR DOM", () => {
  describe("CharacterData", () => {
    it("should create text nodes", () => {
      const node = createTextNode("hello");
      expect(node.nodeType).toBe(3);
      expect(node.nodeName).toBe("#text");
      expect(node.data).toBe("hello");
      expect(node.toString()).toBe("hello");
    });

    it("should create comment nodes", () => {
      const node = createCommentNode("secret");
      expect(node.nodeType).toBe(8);
      expect(node.nodeName).toBe("#comment");
      expect(node.data).toBe("secret");
      expect(node.toString()).toBe("<!--secret-->");
    });
  });

  describe("Parenting and Child Management", () => {
    it("should handle basic parenting", () => {
      const parent = nodeWithElementPropertiesExtension(
        nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: "div" })) as any,
      );
      const child = createTextNode("child");

      parent.appendChild(child);
      expect(parent.childNodes).toContain(child);
      expect(child.parentNode).toBe(parent);
      expect(child.parentElement).toBe(parent);
      expect(parent.toString()).toBe("<div>child</div>");
    });

    it("should move node to new parent", () => {
      const p1 = nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: "p1" }));
      const p2 = nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: "p2" }));
      const child = createTextNode("moving");

      p1.appendChild(child);
      expect(p1.childNodes).toContain(child);
      expect(child.parentNode).toBe(p1);

      p2.appendChild(child);
      expect(p1.childNodes).not.toContain(child);
      expect(p2.childNodes).toContain(child);
      expect(child.parentNode).toBe(p2);
    });

    it("should support insertBefore", () => {
      const parent = nodeWithElementPropertiesExtension(
        nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: "div" })) as any,
      );
      const c1 = createTextNode("1");
      const c2 = createTextNode("2");
      const c3 = createTextNode("3");

      parent.appendChild(c1);
      parent.appendChild(c3);
      parent.insertBefore(c2, c3);

      expect(parent.childNodes).toEqual([c1, c2, c3]);
      expect(parent.toString()).toBe("<div>123</div>");
    });
  });

  describe("Query and Element Methods", () => {
    const createEl = (tag: string, id?: string, className?: string) => {
      const el = nodeWithParentExtension(
        nodeWithElementPropertiesExtension(
          nodeWithChildElementNodesExtension(
            nodeWithChildNodesExtension(createServerNode(ELEMENT_NODE, { tagName: tag, id, className })),
          ) as any,
        ),
      );
      return el;
    };

    it("should query by ID", () => {
      const root = createEl("root");
      const child = createEl("div", "my-id");
      root.appendChild(child);

      expect(root.getElementById("my-id")).toBe(child);
      expect(root.querySelector("#my-id")).toBe(child);
    });

    it("should query by Tag Name", () => {
      const root = createEl("div");
      const span1 = createEl("span");
      const span2 = createEl("span");
      root.appendChild(span1);
      root.appendChild(span2);

      expect(root.getElementsByTagName("span")).toEqual([span1, span2]);
      expect(root.querySelector("span")).toBe(span1);
    });

    it("should query by Class Name", () => {
      const root = createEl("div");
      const c1 = createEl("div", undefined, "foo bar");
      const c2 = createEl("div", undefined, "bar");
      root.appendChild(c1);
      root.appendChild(c2);

      expect(root.getElementsByClassName("bar")).toEqual([c1, c2]);
      expect(root.getElementsByClassName("foo")).toEqual([c1]);
    });
  });
});
