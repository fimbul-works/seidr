import { expect, it } from "vitest";
import { TYPE_ELEMENT } from "../constants";
import { describeDualMode } from "../test-setup";

describeDualMode("Element Parity", ({ getDocument, isSSR }) => {
  it("should create element with correct tagName", () => {
    const doc = getDocument();
    const el = doc.createElement("div");
    expect(el.tagName).toBe("DIV");
    expect(el.nodeName).toBe("DIV");
    expect(el.nodeType).toBe(TYPE_ELEMENT);
  });

  it("should have correct ownerDocument", () => {
    const doc = getDocument();
    const el = doc.createElement("span");
    expect(el.ownerDocument).toBe(doc);
  });

  it("should handle attributes", () => {
    const doc = getDocument();
    const el = doc.createElement("a");
    el.setAttribute("href", "/foo");
    el.setAttribute("title", "link");

    expect(el.getAttribute("href")).toBe("/foo");
    expect(el.getAttribute("title")).toBe("link");
    expect(el.hasAttribute("href")).toBe(true);
    expect(el.hasAttribute("missing")).toBe(false);

    el.removeAttribute("title");
    expect(el.hasAttribute("title")).toBe(false);
    expect(el.getAttribute("title")).toBe(null);
  });

  it("should handle textContent", () => {
    const doc = getDocument();
    const el = doc.createElement("p");
    el.textContent = "hello";
    expect(el.textContent).toBe("hello");

    el.textContent = "world";
    expect(el.textContent).toBe("world");

    el.textContent = null;
    expect(el.textContent).toBe("");
  });

  it("should produce consistent string representation", () => {
    const doc = getDocument();
    const el = doc.createElement("div");
    el.setAttribute("class", "container");
    el.setAttribute("id", "main");
    el.textContent = "Content";

    if (isSSR) {
      // SSR order might depend on implementation details (e.g. object key order)
      // We can use a specific expectation or just verify parts if unstable.
      // Current SSR implementation uses object iteration.
      const str = el.toString();
      // Expecting: <div class="container" id="main">Content</div>  (or similar order)
      expect(str).toContain('class="container"');
      expect(str).toContain('id="main"');
      expect(str).toContain(">Content</div>");
    } else {
      expect(el.outerHTML).toContain('class="container"');
      expect(el.outerHTML).toContain('id="main"');
      expect(el.outerHTML).toContain(">Content</div>");
    }
  });
});
