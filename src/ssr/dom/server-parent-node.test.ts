import { describe, expect, test } from "vitest";
import { TYPE_ELEMENT } from "../../constants";
import { createServerElement } from "./server-element";
import { createServerNode } from "./server-node";
import { applyParentNodeMethods } from "./server-parent-node";
import { createServerTextNode } from "./server-text-node";

describe("ServerParentNode", () => {
  test("append and prepend", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child1 = createServerNode(TYPE_ELEMENT);
    const child2 = createServerNode(TYPE_ELEMENT);

    parent.append(child1);
    parent.prepend(child2);

    expect(parent.childNodes[0]).toBe(child2);
    expect(parent.childNodes[1]).toBe(child1);
  });

  test("replaceChildren", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child1 = createServerNode(TYPE_ELEMENT);
    const child2 = createServerNode(TYPE_ELEMENT);

    parent.appendChild(child1);
    parent.replaceChildren(child2);

    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0]).toBe(child2);
    expect(child1.parentNode).toBe(null);
  });

  test("insertBefore", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child1 = createServerNode(TYPE_ELEMENT);
    const child2 = createServerNode(TYPE_ELEMENT);

    parent.appendChild(child1);
    parent.insertBefore(child2, child1);

    expect(parent.childNodes[0]).toBe(child2);
    expect(parent.childNodes[1]).toBe(child1);
  });

  test("removeChild", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = createServerNode(TYPE_ELEMENT);
    parent.appendChild(child);
    parent.removeChild(child);
    expect(parent.childNodes.length).toBe(0);
    expect(child.parentNode).toBe(null);
  });

  test("getElementById", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = createServerElement("div");
    child.id = "foo";
    parent.appendChild(child);

    expect(parent.getElementById("foo")).toBe(child);
    expect(parent.getElementById("bar")).toBe(null);
  });

  test("getElementsByClassName", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child1 = createServerElement("div");
    child1.className = "foo bar";
    const child2 = createServerElement("div");
    child2.className = "foo";

    parent.appendChild(child1);
    parent.appendChild(child2);

    expect(parent.getElementsByClassName("foo").length).toBe(2);
    expect(parent.getElementsByClassName("bar").length).toBe(1);
  });

  test("text node merging", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const t1 = createServerTextNode("Hello ");
    const t2 = createServerTextNode("World");

    parent.appendChild(t1);
    parent.appendChild(t2);

    expect(parent.childNodes.length).toBe(1);
    expect(parent.textContent).toBe("Hello World");
  });

  test("cycle detection", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    expect(() => parent.appendChild(parent)).toThrow("Cycle detected");
  });

  test("hierarchy error", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    parent.appendChild(child);
    expect(() => child.appendChild(parent)).toThrow("Hierarchy error");
  });

  test("moves node from existing parent", () => {
    const p1 = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const p2 = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = createServerElement("div");

    p1.appendChild(child);
    expect(p1.childNodes.length).toBe(1);
    expect(child.parentNode).toBe(p1);

    p2.appendChild(child);
    expect(p1.childNodes.length).toBe(0);
    expect(p2.childNodes.length).toBe(1);
    expect(child.parentNode).toBe(p2);
  });
});
