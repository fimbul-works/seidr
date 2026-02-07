import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";
import { ELEMENT_NODE } from "../types";

describeDualMode("Element Parity", ({ getDOMFactory, isSSR }) => {
  it("should create element with correct tagName", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("div");
    expect(el.tagName).toBe("DIV");
    expect(el.nodeName).toBe("DIV");
    expect(el.nodeType).toBe(ELEMENT_NODE);
  });

  it("should have correct ownerDocument", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("span");
    const doc = factory.getDocument();
    expect(el.ownerDocument).toBe(doc);
  });

  it("should handle attributes", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("a");
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
    const factory = getDOMFactory();
    const el = factory.createElement("p");
    el.textContent = "hello";
    expect(el.textContent).toBe("hello");

    el.textContent = "world";
    expect(el.textContent).toBe("world");

    el.textContent = null;
    expect(el.textContent).toBe("");
  });

  it("should produce consistent string representation", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("div");
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
