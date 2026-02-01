import { describe, expect, it } from "vitest";
import { createServerCommentNode, createServerTextNode } from "./character-data";
import { COMMENT_NODE, TEXT_NODE } from "./types";

describe("CharacterData Nodes", () => {
  describe("createTextNode", () => {
    it("should create a text node with correct properties", () => {
      const node = createServerTextNode("hello");
      expect(node.nodeType).toBe(TEXT_NODE);
      expect(node.nodeName).toBe("#text");
      expect(node.nodeValue).toBe("hello");
      expect(node.textContent).toBe("hello");
      expect(node.data).toBe("hello");
    });

    it("should escape HTML in toString()", () => {
      const node = createServerTextNode("<script>alert(1)</script>");
      expect(node.toString()).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    });

    it("should update values via data property", () => {
      const node = createServerTextNode("init");
      node.data = "updated";
      expect(node.nodeValue).toBe("updated");
      expect(node.textContent).toBe("updated");
      expect(node.data).toBe("updated");
    });

    it("should update values via nodeValue property", () => {
      const node = createServerTextNode("init");
      node.nodeValue = "updated";
      expect(node.data).toBe("updated");
    });

    it("should provide data manipulation methods", () => {
      const node = createServerTextNode("Hello World");
      expect(node.length).toBe(11);

      node.appendData("!");
      expect(node.data).toBe("Hello World!");

      node.deleteData(0, 6);
      expect(node.data).toBe("World!");

      node.insertData(0, "Big ");
      expect(node.data).toBe("Big World!");

      node.replaceData(4, 5, "City");
      expect(node.data).toBe("Big City!");
    });
  });

  describe("createCommentNode", () => {
    it("should create a comment node with correct properties", () => {
      const node = createServerCommentNode("comment");
      expect(node.nodeType).toBe(COMMENT_NODE);
      expect(node.nodeName).toBe("#comment");
      expect(node.nodeValue).toBe("comment");
      expect(node.data).toBe("comment");
    });

    it("should render correctly in toString()", () => {
      const node = createServerCommentNode("secret");
      expect(node.toString()).toBe("<!--secret-->");
    });
  });
});
