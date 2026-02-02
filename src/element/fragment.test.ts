import { beforeEach, describe, expect, it } from "vitest";
import { getRenderContext, setInternalContext } from "../render-context";
import { describeDualMode, renderToHtml } from "../test-setup/dual-mode";
import { $fragment } from "./fragment";

describeDualMode("SeidrFragment", ({ getDOMFactory, isSSR }) => {
  let container: any;
  let dom: any;

  beforeEach(() => {
    dom = getDOMFactory();
    container = dom.createElement("div");
  });

  it("should create markers", () => {
    const fragment = $fragment([], "test");
    expect(fragment.start.nodeValue).toBe("s:test");
    expect(fragment.end.nodeValue).toBe("e:test");
  });

  it("should generate deterministic IDs", () => {
    const originalContextGetter = getRenderContext as any;
    const mockContext = {
      ctxID: 1,
      idCounter: 10,
      seidrIdCounter: 0,
      randomCounter: 0,
      currentPath: "/",
      fragmentOwners: new WeakMap(),
      fragmentChildren: new WeakMap(),
    };
    setInternalContext(() => mockContext as any);

    try {
      const fragment = $fragment();
      expect(fragment.id).toBe("f-10");
      expect(mockContext.idCounter).toBe(11);

      const fragment2 = $fragment();
      expect(fragment2.id).toBe("f-11");
    } finally {
      setInternalContext(originalContextGetter);
    }
  });

  it("should append to parent", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    // Use dom-agnostic way to check presence
    const html = renderToHtml(container);
    expect(html).toContain("<!--s:test-->");
    expect(html).toContain("<!--e:test-->");
  });

  it("should append nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    const node1 = dom.createElement("span");
    const node2 = dom.createElement("div");

    fragment.appendChild(node1);
    fragment.appendChild(node2);

    expect(fragment.nodes).toEqual([node1, node2]);
    const html = renderToHtml(container);
    // If this fails, it might be because insertRaw/insertAt markers logic is wrong.
    expect(html).toBe("<div><!--s:test--><span></span><div></div><!--e:test--></div>");
  });

  it("should insertBefore nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    const node1 = dom.createElement("span");
    const node2 = dom.createElement("div");
    const node3 = dom.createElement("p");

    fragment.appendChild(node1);
    fragment.appendChild(node2);
    fragment.insertBefore(node3, node2);

    expect(fragment.nodes).toEqual([node1, node3, node2]);
    const html = renderToHtml(container);
    expect(html).toBe("<div><!--s:test--><span></span><p></p><div></div><!--e:test--></div>");
  });

  it("should clear nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    fragment.appendChild(dom.createElement("span"));
    fragment.appendChild(dom.createElement("div"));

    fragment.clear();
    expect(fragment.nodes).toEqual([]);
    const html = renderToHtml(container);
    expect(html).toBe("<div><!--s:test--><!--e:test--></div>");
  });

  it("should append nodes via append", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(dom.createElement("span"), "text");
    expect(fragment.nodes.length).toBe(2);
    const html = renderToHtml(container);
    expect(html).toContain("<span></span>text");
  });

  it("should prepend nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(dom.createElement("div"));
    fragment.prepend(dom.createElement("span"), "start");
    const html = renderToHtml(container);
    expect(html).toContain("<span></span>start<div></div>");
  });

  it("should replaceChildren", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(dom.createElement("div"));
    fragment.replaceChildren(dom.createElement("span"));
    const html = renderToHtml(container);
    expect(html).toContain("<span></span>");
    // Check that there are NO divs INSIDE the container's contents between markers
    expect(html).not.toContain("<!--s:test--><div></div><!--e:test-->");
  });

  it("should query nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    const span = dom.createElement("span");
    span.id = "my-span";
    // For SSR, we might need to set attribute if id doesn't work directly
    if (isSSR) {
      span.setAttribute("id", "my-span");
    } else {
      span.id = "my-span";
    }

    fragment.append(span);
    expect(fragment.querySelector("span")).toBe(span);
    expect(fragment.getElementById("my-span")).toBe(span);
    expect(Array.from(fragment.querySelectorAll("span"))).toEqual([span]);
  });

  it("should remove markers and nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.appendChild(dom.createElement("span"));

    fragment.remove();
    const html = renderToHtml(container);
    expect(html).toBe("<div></div>");
  });

  it("should remove markers in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const s = dom.createComment("s:prod");
      const e = dom.createComment("e:prod");
      const node = dom.createElement("div");

      // Manually append for hydration simulation
      container.appendChild(s);
      container.appendChild(node);
      container.appendChild(e);

      // Hydrate from existing markers
      // In production, $fragment will remove s and e from DOM if they were found
      const fragment = $fragment([], "prod", s, e);

      const html = renderToHtml(container);
      expect(html).toBe("<div><div></div></div>");
      expect(fragment.nodes).toEqual([node]);

      const newNode = dom.createElement("span");
      fragment.appendChild(newNode);
      const html2 = renderToHtml(container);
      expect(html2).toBe("<div><div></div><span></span></div>");
      expect(fragment.nodes).toEqual([node, newNode]);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
