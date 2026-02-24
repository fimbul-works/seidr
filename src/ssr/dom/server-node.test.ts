import { describe, expect, test } from "vitest";
import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { createServerDocument } from "./server-document";
import { createServerNode } from "./server-node";
import { applyParentNodeMethods } from "./server-parent-node";
import { createServerElement } from "./server-element";
import { createServerTextNode } from "./server-text-node";

describe("ServerNode", () => {
  test("creates a node with the correct type", () => {
    const node = createServerNode(TYPE_ELEMENT);
    expect(node.nodeType).toBe(TYPE_ELEMENT);
  });

  test("nodeName is correct for different types", () => {
    expect(createServerNode(TYPE_TEXT_NODE).nodeName).toBe("#text");
    expect(createServerNode(TYPE_COMMENT_NODE).nodeName).toBe("#comment");
    expect(createServerNode(TYPE_DOCUMENT).nodeName).toBe("#document");

    const el = createServerElement("div");
    expect(el.nodeName).toBe("DIV");
  });

  test("ownerDocument and parentNode tracking", () => {
    const doc = createServerDocument();
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT, doc));
    const child = createServerNode(TYPE_TEXT_NODE);

    expect(parent.ownerDocument).toBe(doc);
    expect(child.parentNode).toBe(null);

    parent.appendChild(child);
    expect(child.parentNode).toBe(parent);
    expect(child.ownerDocument).toBe(doc);
  });

  test("nextSibling and previousSibling", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child1 = createServerNode(TYPE_ELEMENT);
    const child2 = createServerNode(TYPE_ELEMENT);
    const child3 = createServerNode(TYPE_ELEMENT);

    parent.appendChild(child1);
    parent.appendChild(child2);
    parent.appendChild(child3);

    expect(child1.nextSibling).toBe(child2);
    expect(child1.previousSibling).toBe(null);

    expect(child2.nextSibling).toBe(child3);
    expect(child2.previousSibling).toBe(child1);

    expect(child3.nextSibling).toBe(null);
    expect(child3.previousSibling).toBe(child2);
  });

  test("isConnected", () => {
    const doc = createServerNode(TYPE_DOCUMENT);
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = createServerNode(TYPE_TEXT_NODE);

    expect(doc.isConnected).toBe(true);
    expect(parent.isConnected).toBe(false);

    parent.appendChild(child);
    expect(child.isConnected).toBe(false);

    const root = applyParentNodeMethods(doc);
    root.appendChild(parent);

    expect(parent.isConnected).toBe(true);
    expect(child.isConnected).toBe(true);
  });

  test("contains", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const grandchild = createServerNode(TYPE_TEXT_NODE);

    parent.appendChild(child);
    child.appendChild(grandchild);

    expect(parent.contains(child)).toBe(true);
    expect(parent.contains(grandchild)).toBe(true);
    expect(child.contains(grandchild)).toBe(true);
    expect(grandchild.contains(parent)).toBe(false);
    expect(parent.contains(parent)).toBe(true);
  });

  test("textContent", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const t1 = createServerTextNode("Hello ");
    const t2 = createServerTextNode("World");

    parent.appendChild(t1);
    parent.appendChild(t2);

    expect(parent.textContent).toBe("Hello World");

    parent.textContent = "";
    expect(parent.childNodes.length).toBe(0);
  });

  test("remove", () => {
    const parent = applyParentNodeMethods(createServerNode(TYPE_ELEMENT));
    const child = createServerTextNode("Hello");
    parent.appendChild(child);

    expect(parent.childNodes.length).toBe(1);
    child.remove();
    expect(parent.childNodes.length).toBe(0);
    expect(child.parentNode).toBe(null);
  });

  test("baseURI", () => {
    const node = createServerNode(TYPE_ELEMENT);
    expect(node.baseURI).toBe("/");
  });

  test("nodeValue", () => {
    const node = createServerTextNode("foo");
    expect(node.nodeValue).toBe("foo");

    const el = createServerElement("div");
    expect(el.nodeValue).toBe(null);
  });
});
