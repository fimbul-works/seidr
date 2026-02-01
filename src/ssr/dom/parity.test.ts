import { describe, expect, it } from "vitest";
import { createServerDocument } from "./document";
import { createServerDocumentFragment } from "./document-fragment";
import { createServerElement } from "./element";
import { createServerTextNode } from "./text";

describe("SSR DOM Parity", () => {
  describe("Node Properties", () => {
    it("should have correct nodeType and nodeName", () => {
      const el = createServerElement("div");
      expect(el.nodeType).toBe(1);
      expect(el.nodeName).toBe("DIV");

      const text = createServerTextNode("hello");
      expect(text.nodeType).toBe(3);
      expect(text.nodeName).toBe("#text");
    });

    it("should track parentNode correctly", () => {
      const parent = createServerElement("div");
      const child = createServerElement("span");
      parent.appendChild(child);

      expect(child.parentNode).toBe(parent);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.childNodes[0]).toBe(child);
    });

    it("should report isConnected correctly", () => {
      const doc = createServerDocument();
      const parent = createServerElement("div");
      const child = createServerElement("span");

      expect(parent.isConnected).toBe(false);
      parent.appendChild(child);
      expect(child.isConnected).toBe(false);

      doc.appendChild(parent);
      expect(parent.isConnected).toBe(true);
      expect(child.isConnected).toBe(true);
    });
  });

  describe("Element Attributes & Proxies", () => {
    it("should handle id and className", () => {
      const el = createServerElement("div");
      el.id = "foo";
      el.className = "bar baz";

      expect(el.getAttribute("id")).toBe("foo");
      expect(el.getAttribute("class")).toBe("bar baz");
      expect(el.toString()).toContain('class="bar baz"');
      expect(el.toString()).toContain('id="foo"');
    });

    it("should handle dataset via Proxy", () => {
      const el = createServerElement("div");
      el.dataset.fooBar = "baz";
      expect(el.getAttribute("data-foo-bar")).toBe("baz");
      expect(el.dataset.fooBar).toBe("baz");
    });

    it("should handle style via Proxy", () => {
      const el = createServerElement("div");
      el.style.color = "red";
      el.style.backgroundColor = "blue";

      const html = el.toString();
      expect(html).toContain('style="background-color:blue;color:red"');
    });
  });

  describe("Serialization (toString)", () => {
    it("should render simple element to HTML", () => {
      const el = createServerElement("div");
      el.id = "test";
      el.appendChild(createServerTextNode("content"));

      expect(el.toString()).toBe('<div id="test">content</div>');
    });

    it("should handle self-closing tags", () => {
      const img = createServerElement("img");
      img.setAttribute("src", "test.jpg");
      expect(img.toString()).toBe('<img src="test.jpg">');
    });

    it("should escape special characters in text and attributes", () => {
      const el = createServerElement("div");
      el.setAttribute("title", 'a "quote"');
      el.appendChild(createServerTextNode("3 < 5 & 4 > 2"));

      expect(el.toString()).toBe('<div title="a &quot;quote&quot;">3 &lt; 5 &amp; 4 &gt; 2</div>');
    });
  });

  describe("DocumentFragment", () => {
    it("should hold multiple children and serialize them", () => {
      const frag = createServerDocumentFragment();
      frag.appendChild(createServerTextNode("A"));
      frag.appendChild(createServerElement("br"));
      frag.appendChild(createServerTextNode("B"));

      expect(frag.toString()).toBe("A<br>B");
    });
  });

  describe("Query Methods", () => {
    it("should find elements by id", () => {
      const parent = createServerElement("div");
      const child = createServerElement("span");
      child.id = "target";
      parent.appendChild(child);

      expect(parent.getElementById("target")).toBe(child);
      expect(parent.querySelector("#target")).toBe(child);
    });

    it("should find elements by class name", () => {
      const parent = createServerElement("div");
      const child = createServerElement("span");
      child.className = "foo bar";
      parent.appendChild(child);

      expect(parent.getElementsByClassName("foo").length).toBe(1);
      expect(parent.getElementsByClassName("foo")[0]).toBe(child);
      expect(parent.querySelector(".bar")).toBe(child);
    });

    it("should find elements by tag name", () => {
      const parent = createServerElement("div");
      parent.appendChild(createServerElement("span"));
      parent.appendChild(createServerElement("span"));

      expect(parent.getElementsByTagName("span").length).toBe(2);
      expect(parent.querySelector("span")).toBe(parent.childNodes[0]);
    });

    it("should support deep queries", () => {
      const root = createServerElement("div");
      const mid = createServerElement("div");
      const target = createServerElement("span");
      target.id = "deep";

      root.appendChild(mid);
      mid.appendChild(target);

      expect(root.querySelector("#deep")).toBe(target);
    });
  });

  describe("Advanced Manipulation", () => {
    it("should support classList operations", () => {
      const el = createServerElement("div");
      el.classList.add("foo", "bar");
      expect(el.className).toBe("foo bar");
      expect(el.classList.contains("foo")).toBe(true);

      el.classList.remove("foo");
      expect(el.className).toBe("bar");

      el.classList.toggle("baz");
      expect(el.className).toBe("bar baz");
    });

    it("should support innerHTML getter and setter", () => {
      const el = createServerElement("div");
      el.innerHTML = "<span>test</span>";
      expect(el.toString()).toBe("<div><span>test</span></div>");
      expect(el.innerHTML).toBe("<span>test</span>");
    });

    it("should support contains (recursive)", () => {
      const root = createServerElement("div");
      const mid = createServerElement("div");
      const leaf = createServerElement("span");

      root.appendChild(mid);
      mid.appendChild(leaf);

      expect(root.contains(root)).toBe(true);
      expect(root.contains(mid)).toBe(true);
      expect(root.contains(leaf)).toBe(true);
      expect(mid.contains(leaf)).toBe(true);
      expect(leaf.contains(root)).toBe(false);
    });

    it("should handle replaceChildren", () => {
      const el = createServerElement("div");
      el.appendChild(createServerElement("span"));
      el.replaceChildren(createServerTextNode("replaced"));
      expect(el.toString()).toBe("<div>replaced</div>");
    });
  });
});
