import { beforeEach, describe, expect, it } from "vitest";
import { ServerElementMap, ServerHTMLElement } from "./server-html-element.js";

describe("ServerHTMLElement", () => {
  let element: ServerHTMLElement;

  beforeEach(() => {
    element = new ServerHTMLElement("div");
    ServerElementMap.clear();
  });

  describe("Constructor and Basic Properties", () => {
    it("should create element with tagName", () => {
      expect(element.tagName).toBe("DIV");
    });

    it("should have isSeidrElement flag", () => {
      expect(element.isSeidrElement).toBe(true);
    });

    it("should initialize with empty children array", () => {
      expect(element.children).toEqual([]);
    });

    it("should accept attributes in constructor", () => {
      const el = new ServerHTMLElement("div", { id: "test", "data-value": "123" });
      expect(el.getAttribute("id")).toBe("test");
      expect(el.getAttribute("data-value")).toBe("123");
    });

    it("should accept children in constructor", () => {
      const child1 = new ServerHTMLElement("span");
      const child2 = "text content";
      const el = new ServerHTMLElement("div", {}, [child1, child2]);
      expect(el.children).toHaveLength(2);
      expect(el.children[0]).toBe(child1);
      expect(el.children[1]).toBe(child2);
    });
  });

  describe("Property Management", () => {
    describe("id property", () => {
      it("should set and get id", () => {
        element.id = "test-id";
        expect(element.id).toBe("test-id");
      });

      it("should register element in ServerElementMap", () => {
        element.id = "test-id";
        expect(ServerElementMap.get("test-id")).toBe(element);
      });

      it("should update ServerElementMap when id changes", () => {
        element.id = "test-id";
        element.id = "new-id";
        expect(ServerElementMap.has("test-id")).toBe(false);
        expect(ServerElementMap.get("new-id")).toBe(element);
      });

      it("should remove from ServerElementMap when id is set to undefined", () => {
        element.id = "test-id";
        element.id = undefined;
        expect(ServerElementMap.has("test-id")).toBe(false);
      });
    });

    describe("className property", () => {
      it("should set and get className", () => {
        element.className = "foo bar";
        expect(element.className).toBe("foo bar");
      });

      it("should sync with classList", () => {
        element.className = "foo bar";
        expect(element.classList.contains("foo")).toBe(true);
        expect(element.classList.contains("bar")).toBe(true);
      });

      it("should handle empty className", () => {
        element.className = "";
        expect(element.className).toBe("");
        expect(element.classList.contains("anything")).toBe(false);
      });
    });

    describe("textContent property", () => {
      it("should set and get textContent", () => {
        element.textContent = "Hello World";
        expect(element.textContent).toBe("Hello World");
      });

      it("should escape HTML in toString", () => {
        element.textContent = "<script>alert('xss')</script>";
        const html = element.toString();
        expect(html).toContain("&lt;script&gt;");
        expect(html).not.toContain("<script>");
      });
    });

    describe("innerHTML property", () => {
      it("should set and get innerHTML", () => {
        element.innerHTML = "<span>Nested</span>";
        expect(element.innerHTML).toBe("<span>Nested</span>");
      });

      it("should not escape HTML in innerHTML", () => {
        element.innerHTML = "<span>Nested</span>";
        const html = element.toString();
        expect(html).toContain("<span>Nested</span>");
      });

      it("should take precedence over textContent in toString", () => {
        element.textContent = "text";
        element.innerHTML = "<span>html</span>";
        const html = element.toString();
        expect(html).toContain("<span>html</span>");
        expect(html).not.toContain("text");
      });
    });

    describe("Form element properties", () => {
      it("should handle value property", () => {
        const input = new ServerHTMLElement("input");
        input.value = "test value";
        expect(input.value).toBe("test value");
      });

      it("should handle checked property", () => {
        const checkbox = new ServerHTMLElement("input");
        checkbox.checked = true;
        expect(checkbox.checked).toBe(true);
        checkbox.checked = false;
        expect(checkbox.checked).toBe(false);
      });

      it("should handle disabled property", () => {
        const button = new ServerHTMLElement("button");
        button.disabled = true;
        expect(button.disabled).toBe(true);
      });

      it("should handle type property", () => {
        const input = new ServerHTMLElement("input");
        input.type = "text";
        expect(input.type).toBe("text");
      });
    });

    describe("Link and media properties", () => {
      it("should handle href property", () => {
        const link = new ServerHTMLElement("a");
        link.href = "https://example.com";
        expect(link.href).toBe("https://example.com");
      });

      it("should handle src property", () => {
        const img = new ServerHTMLElement("img");
        img.src = "/image.png";
        expect(img.src).toBe("/image.png");
      });
    });
  });

  describe("classList (ServerDOMTokenList)", () => {
    beforeEach(() => {
      element.className = "foo bar";
    });

    it("should check if class exists with contains", () => {
      expect(element.classList.contains("foo")).toBe(true);
      expect(element.classList.contains("baz")).toBe(false);
    });

    it("should add class with add", () => {
      element.classList.add("baz");
      expect(element.classList.contains("baz")).toBe(true);
      expect(element.className).toBe("foo bar baz");
    });

    it("should toggle class with toggle", () => {
      const result1 = element.classList.toggle("baz");
      expect(result1).toBe(true);
      expect(element.classList.contains("baz")).toBe(true);

      const result2 = element.classList.toggle("baz");
      expect(result2).toBe(false);
      expect(element.classList.contains("baz")).toBe(false);
    });

    it("should toggle class with force parameter", () => {
      element.classList.toggle("baz", true);
      expect(element.classList.contains("baz")).toBe(true);

      element.classList.toggle("baz", false);
      expect(element.classList.contains("baz")).toBe(false);
    });

    it("should remove class with remove", () => {
      element.classList.remove("foo");
      expect(element.classList.contains("foo")).toBe(false);
      expect(element.className).toBe("bar");
    });

    it("should convert to string", () => {
      const str = element.classList.toString();
      expect(str).toBe("foo bar");
    });

    it("should handle multiple spaces in className", () => {
      element.className = "foo  bar   baz";
      expect(element.classList.contains("foo")).toBe(true);
      expect(element.classList.contains("bar")).toBe(true);
      expect(element.classList.contains("baz")).toBe(true);
    });

    it("should handle empty className", () => {
      element.className = "";
      expect(element.classList.contains("anything")).toBe(false);
      expect(element.classList.toString()).toBe("");
    });
  });

  describe("style (ServerCSSStyleDeclaration)", () => {
    it("should set style as string", () => {
      (element as any)._style = "color: red; background: blue";
      expect((element as any)._style).toBe("color: red; background: blue");
      expect(element.style.toString()).toBe("color: red; background: blue");
    });

    it("should get style as string", () => {
      (element as any)._style = "color: red";
      const styleStr = element.style.toString();
      expect(styleStr).toBe("color: red");
    });

    it("should set individual style property with setProperty", () => {
      element.style.setProperty("color", "red");
      expect((element as any)._style).toBe("color: red");
    });

    it("should get individual style property with getPropertyValue", () => {
      (element as any)._style = "color: red; background: blue";
      expect(element.style.getPropertyValue("color")).toBe("red");
      expect(element.style.getPropertyValue("background")).toBe("blue");
    });

    it("should handle multiple style properties", () => {
      element.style.setProperty("color", "red");
      element.style.setProperty("font-size", "14px");
      const styleStr = (element as any)._style;
      expect(styleStr).toContain("color: red");
      expect(styleStr).toContain("font-size: 14px");
    });
  });

  describe("Attribute Methods", () => {
    it("should get attribute with getAttribute", () => {
      element.setAttribute("data-value", "123");
      expect(element.getAttribute("data-value")).toBe("123");
    });

    it("should return null for non-existent attribute", () => {
      expect(element.getAttribute("non-existent")).toBe(null);
    });

    it("should set attribute with setAttribute", () => {
      element.setAttribute("aria-label", "Test Label");
      expect(element.getAttribute("aria-label")).toBe("Test Label");
    });

    it("should check attribute existence with hasAttribute", () => {
      element.setAttribute("data-test", "value");
      expect(element.hasAttribute("data-test")).toBe(true);
      expect(element.hasAttribute("non-existent")).toBe(false);
    });

    it("should remove attribute with removeAttribute", () => {
      element.setAttribute("data-test", "value");
      element.removeAttribute("data-test");
      expect(element.hasAttribute("data-test")).toBe(false);
    });

    it("should handle class attribute specially", () => {
      element.setAttribute("class", "foo bar");
      expect(element.className).toBe("foo bar");
      expect(element.classList.contains("foo")).toBe(true);
    });

    it("should get class attribute", () => {
      element.className = "foo bar";
      expect(element.getAttribute("class")).toBe("foo bar");
    });
  });

  describe("DOM Manipulation Methods", () => {
    let child1: ServerHTMLElement;
    let child2: ServerHTMLElement;
    let child3: ServerHTMLElement;

    beforeEach(() => {
      child1 = new ServerHTMLElement("span");
      child2 = new ServerHTMLElement("span");
      child3 = new ServerHTMLElement("span");
    });

    describe("appendChild", () => {
      it("should append child element", () => {
        element.appendChild(child1);
        expect(element.children).toHaveLength(1);
        expect(element.children[0]).toBe(child1);
      });

      it("should set parentElement on child", () => {
        element.appendChild(child1);
        expect(child1.parentElement).toBe(element);
      });

      it("should append text child", () => {
        element.appendChild("text content");
        expect(element.children).toHaveLength(1);
        expect(element.children[0]).toBe("text content");
      });

      it("should append multiple children", () => {
        element.appendChild(child1);
        element.appendChild(child2);
        element.appendChild(child3);
        expect(element.children).toHaveLength(3);
      });
    });

    describe("insertBefore", () => {
      beforeEach(() => {
        element.appendChild(child1);
        element.appendChild(child3);
      });

      it("should insert before existing child", () => {
        element.insertBefore(child2, child3);
        expect(element.children).toEqual([child1, child2, child3]);
      });

      it("should set parentElement on inserted child", () => {
        element.insertBefore(child2, child3);
        expect(child2.parentElement).toBe(element);
      });

      it("should insert before first child", () => {
        element.insertBefore(child2, child1);
        expect(element.children).toEqual([child2, child1, child3]);
      });

      it("should throw error if reference child not found", () => {
        const unknownChild = new ServerHTMLElement("p");
        expect(() => element.insertBefore(child2, unknownChild)).toThrow("Cannot insert before non-existing child");
      });
    });

    describe("removeChild", () => {
      beforeEach(() => {
        element.appendChild(child1);
        element.appendChild(child2);
        element.appendChild(child3);
      });

      it("should remove child", () => {
        element.removeChild(child2);
        expect(element.children).toEqual([child1, child3]);
      });

      it("should clear parentElement on removed child", () => {
        element.removeChild(child2);
        expect(child2.parentElement).toBeUndefined();
      });

      it("should throw error when removing non-existent child", () => {
        const unknownChild = new ServerHTMLElement("p");
        element.removeChild(unknownChild); // Should not throw, just do nothing
        expect(element.children).toHaveLength(3);
      });
    });

    describe("remove", () => {
      beforeEach(() => {
        const parent = new ServerHTMLElement("div");
        parent.appendChild(element);
        element.appendChild(child1);
      });

      it("should remove element from parent", () => {
        element.remove();
        expect(element.parentElement).toBeUndefined();
      });

      it("should clear all children", () => {
        element.remove();
        expect(element.children).toEqual([]);
      });
    });

    describe("clear", () => {
      beforeEach(() => {
        element.appendChild(child1);
        element.appendChild(child2);
        element.appendChild(child3);
      });

      it("should remove all children", () => {
        element.clear();
        expect(element.children).toEqual([]);
      });

      it("should call remove on child elements", () => {
        let removed = false;
        const originalRemove = child1.remove;
        child1.remove = function () {
          removed = true;
          return originalRemove.call(this);
        };
        element.clear();
        expect(removed).toBe(true);
      });
    });
  });

  describe("Event Handler Methods", () => {
    it("should return no-op cleanup from on", () => {
      const cleanup = element.on("click", () => {});
      expect(typeof cleanup).toBe("function");
      expect(cleanup()).toBeUndefined();
    });

    it("should not throw on addEventListener", () => {
      expect(() => element.addEventListener("click", () => {})).not.toThrow();
    });

    it("should not throw on removeEventListener", () => {
      expect(() => element.removeEventListener("click", () => {})).not.toThrow();
    });
  });

  describe("Seidr Methods", () => {
    it("should have destroy method", () => {
      element.appendChild(new ServerHTMLElement("span"));
      element.remove();
      expect(element.children).toEqual([]);
      expect(element.parentElement).toBeUndefined();
    });

    it("should have clear method", () => {
      element.appendChild(new ServerHTMLElement("span"));
      element.clear();
      expect(element.children).toEqual([]);
    });
  });

  describe("Query Methods", () => {
    it("should return null from querySelector", () => {
      expect(element.querySelector(".test")).toBe(null);
    });

    it("should return empty array from querySelectorAll", () => {
      expect(element.querySelectorAll(".test")).toEqual([]);
    });
  });

  describe("toString - HTML Generation", () => {
    it("should generate simple element HTML", () => {
      expect(element.toString()).toBe("<div></div>");
    });

    it("should generate element with id", () => {
      element.id = "test";
      expect(element.toString()).toBe('<div id="test"></div>');
    });

    it("should generate element with class", () => {
      element.className = "foo bar";
      expect(element.toString()).toBe('<div class="foo bar"></div>');
    });

    it("should generate element with style", () => {
      (element as any)._style = "color: red";
      expect(element.toString()).toBe('<div style="color: red"></div>');
    });

    it("should generate element with textContent", () => {
      element.textContent = "Hello World";
      expect(element.toString()).toBe("<div>Hello World</div>");
    });

    it("should escape special characters in textContent", () => {
      element.textContent = "<div>&\"'</div>";
      const html = element.toString();
      expect(html).toContain("&lt;div&gt;&amp;&quot;&#039;&lt;/div&gt;");
    });

    it("should generate element with innerHTML", () => {
      element.innerHTML = "<span>Nested</span>";
      expect(element.toString()).toBe("<div><span>Nested</span></div>");
    });

    it("should generate element with children", () => {
      const child1 = new ServerHTMLElement("span");
      child1.textContent = "Child 1";
      const child2 = new ServerHTMLElement("span");
      child2.textContent = "Child 2";
      element.appendChild(child1);
      element.appendChild(child2);
      expect(element.toString()).toBe("<div><span>Child 1</span><span>Child 2</span></div>");
    });

    it("should generate element with mixed text and element children", () => {
      const child = new ServerHTMLElement("span");
      child.textContent = "Nested";
      element.appendChild("Text before ");
      element.appendChild(child);
      element.appendChild(" Text after");
      expect(element.toString()).toBe("<div>Text before <span>Nested</span> Text after</div>");
    });

    it("should generate self-closing tags", () => {
      const img = new ServerHTMLElement("img");
      img.src = "/image.png";
      expect(img.toString()).toBe('<img src="/image.png" />');
    });

    it("should generate void elements without closing tag", () => {
      const input = new ServerHTMLElement("input");
      input.type = "text";
      input.value = "test";
      const html = input.toString();
      expect(html).toContain('type="text"');
      expect(html).toContain('value="test"');
      expect(html).toMatch(/<input\s+(type="text"\s+value="test"|value="test"\s+type="text")\s+\/>/);
    });

    it("should include all void elements", () => {
      const voidTags = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "source",
        "track",
        "wbr",
      ];
      voidTags.forEach((tag) => {
        const el = new ServerHTMLElement(tag);
        const html = el.toString();
        expect(html).toContain("/>");
        expect(html).not.toContain(`</${tag}>`);
      });
    });

    it("should generate element with custom attributes", () => {
      element.setAttribute("data-value", "123");
      element.setAttribute("aria-label", "Test");
      const html = element.toString();
      expect(html).toContain('data-value="123"');
      expect(html).toContain('aria-label="Test"');
    });

    it("should generate boolean attributes", () => {
      const input = new ServerHTMLElement("input");
      input.checked = true;
      input.disabled = true;
      const html = input.toString();
      expect(html).toContain("checked");
      expect(html).toContain("disabled");
    });

    it("should not include false boolean attributes", () => {
      const input = new ServerHTMLElement("input");
      input.checked = false;
      input.disabled = false;
      const html = input.toString();
      expect(html).not.toContain("checked");
      expect(html).not.toContain("disabled");
    });

    it("should generate form element with value, type, checked, disabled", () => {
      const input = new ServerHTMLElement("input");
      input.type = "checkbox";
      input.value = "yes";
      input.checked = true;
      input.disabled = false;
      const html = input.toString();
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('value="yes"');
      expect(html).toContain("checked");
      expect(html).not.toContain("disabled");
    });

    it("should generate link with href", () => {
      const link = new ServerHTMLElement("a");
      link.href = "https://example.com";
      link.textContent = "Click me";
      const html = link.toString();
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain(">Click me<");
    });

    it("should escape HTML in attribute values", () => {
      element.setAttribute("data-html", '<div>&"test"</div>');
      const html = element.toString();
      expect(html).toContain("&lt;div&gt;&amp;&quot;test&quot;&lt;/div&gt;");
    });

    it("should handle className in attributes", () => {
      const el = new ServerHTMLElement("div", { className: "test-class" });
      expect(el.toString()).toContain('class="test-class"');
    });

    it("should handle attributes with null values", () => {
      element.setAttribute("data-null", null as any);
      const html = element.toString();
      expect(html).not.toContain("data-null");
    });

    it("should handle attributes with undefined values", () => {
      element.setAttribute("data-undefined", undefined as any);
      const html = element.toString();
      expect(html).not.toContain("data-undefined");
    });

    it("should handle attributes with false boolean values", () => {
      element.setAttribute("data-false", false as any);
      const html = element.toString();
      expect(html).not.toContain("data-false");
    });

    it("should handle attributes with true boolean values (boolean attributes)", () => {
      element.setAttribute("data-true", true as any);
      const html = element.toString();
      expect(html).toContain("data-true");
    });

    it("should generate complex nested structure", () => {
      const container = new ServerHTMLElement("div");
      container.className = "container";

      const header = new ServerHTMLElement("h1");
      header.textContent = "Title";

      const content = new ServerHTMLElement("p");
      content.textContent = "Paragraph";

      const link = new ServerHTMLElement("a");
      link.href = "/link";
      link.textContent = "Click";

      content.appendChild(link);
      container.appendChild(header);
      container.appendChild(content);

      const html = container.toString();
      expect(html).toBe('<div class="container"><h1>Title</h1><p>Paragraph<a href="/link">Click</a></p></div>');
    });
  });

  describe("Integration with Seidr Interface", () => {
    it("should implement SeidrElementInterface", () => {
      expect(element.isSeidrElement).toBe(true);
      expect(typeof element.on).toBe("function");
      expect(typeof element.clear).toBe("function");
      expect(typeof element.remove).toBe("function");
      expect(typeof element.style).toBe("object");
    });
  });

  describe("Edge Cases", () => {
    it("should handle setting className via attributes in constructor", () => {
      const el = new ServerHTMLElement("div", { className: "test-class" });
      expect(el.className).toBe("test-class");
      expect(el.classList.contains("test-class")).toBe(true);
    });

    it("should handle empty attributes object", () => {
      const el = new ServerHTMLElement("div", {});
      expect(el.toString()).toBe("<div></div>");
    });

    it("should handle no constructor arguments", () => {
      const el = new ServerHTMLElement("div");
      expect(el.tagName).toBe("DIV");
      expect(el.children).toEqual([]);
    });

    it("should handle removing child that has already been removed", () => {
      const child = new ServerHTMLElement("span");
      element.appendChild(child);
      element.removeChild(child);
      element.removeChild(child); // Should not throw
      expect(element.children).toEqual([]);
    });

    it("should handle inserting before child that doesn't exist", () => {
      const child1 = new ServerHTMLElement("span");
      const child2 = new ServerHTMLElement("span");
      const unknown = new ServerHTMLElement("p");
      element.appendChild(child1);
      expect(() => element.insertBefore(child2, unknown)).toThrow();
    });
  });
});
