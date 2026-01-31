import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setInternalContext } from "../render-context";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { $fragment } from "./fragment";

describe("SeidrFragment", () => {
  let container: HTMLElement;
  let cleanup: CleanupFunction;

  beforeEach(() => {
    cleanup = enableClientMode();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    cleanup();
    container.remove();
  });

  it("should create markers", () => {
    const fragment = $fragment([], "test");
    expect(fragment.start.nodeValue).toBe("s:test");
    expect(fragment.end.nodeValue).toBe("e:test");
  });

  it("should generate deterministic IDs", () => {
    const mockContext = {
      ctxID: 1,
      idCounter: 10,
      seidrIdCounter: 0,
      randomCounter: 0,
      currentPath: "/",
    };
    setInternalContext(() => mockContext as any);

    const fragment = $fragment();
    expect(fragment.id).toBe("f-10");
    expect(mockContext.idCounter).toBe(11);

    const fragment2 = $fragment();
    expect(fragment2.id).toBe("f-11");
  });

  it("should append to parent", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    expect(container.contains(fragment.start)).toBe(true);
    expect(container.contains(fragment.end)).toBe(true);
    expect(fragment.start.nextSibling).toBe(fragment.end);
  });

  it("should append nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    const node1 = document.createElement("span");
    const node2 = document.createElement("div");

    fragment.appendChild(node1);
    fragment.appendChild(node2);

    expect(fragment.nodes).toEqual([node1, node2]);
    expect(fragment.start.nextSibling).toBe(node1);
    expect(node1.nextSibling).toBe(node2);
    expect(node2.nextSibling).toBe(fragment.end);
  });

  it("should insertBefore nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    const node1 = document.createElement("span");
    const node2 = document.createElement("div");
    const node3 = document.createElement("p");

    fragment.appendChild(node1);
    fragment.appendChild(node2);
    fragment.insertBefore(node3, node2);

    expect(fragment.nodes).toEqual([node1, node3, node2]);
  });

  it("should clear nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);

    fragment.appendChild(document.createElement("span"));
    fragment.appendChild(document.createElement("div"));

    fragment.clear();
    expect(fragment.nodes).toEqual([]);
    expect(fragment.start.nextSibling).toBe(fragment.end);
  });

  it("should append nodes via append", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(document.createElement("span"), "text");
    expect(fragment.nodes.length).toBe(2);
    expect(container.innerHTML).toContain("<span></span>text");
  });

  it("should prepend nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(document.createElement("div"));
    fragment.prepend(document.createElement("span"), "start");
    expect(container.innerHTML).toContain("<span></span>start<div></div>");
  });

  it("should replaceChildren", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.append(document.createElement("div"));
    fragment.replaceChildren(document.createElement("span"));
    expect(container.innerHTML).toContain("<span></span>");
    expect(container.innerHTML).not.toContain("div");
  });

  it("should query nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    const span = document.createElement("span");
    span.id = "my-span";
    fragment.append(span);
    expect(fragment.querySelector("span")).toBe(span);
    expect(fragment.getElementById("my-span")).toBe(span);
    expect(fragment.querySelectorAll("span")).toEqual([span]);
  });

  it("should remove markers and nodes", () => {
    const fragment = $fragment([], "test");
    fragment.appendTo(container);
    fragment.appendChild(document.createElement("span"));

    fragment.remove();
    expect(container.innerHTML).toBe("");
  });

  it("should remove markers in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const s = document.createComment("s:prod");
      const e = document.createComment("e:prod");
      const node = document.createElement("div");
      container.appendChild(s);
      container.appendChild(node);
      container.appendChild(e);

      // Hydrate from existing markers
      const fragment = $fragment([], "prod", s, e);
      expect(container.contains(s)).toBe(false);
      expect(container.contains(e)).toBe(false);
      expect(container.innerHTML).toBe("<div></div>");
      expect(fragment.nodes).toEqual([node]);

      const newNode = document.createElement("span");
      fragment.appendChild(newNode);
      expect(container.innerHTML).toBe("<div></div><span></span>");
      expect(fragment.nodes).toEqual([node, newNode]);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
