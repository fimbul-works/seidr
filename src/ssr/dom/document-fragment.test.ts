import { describe, expect, it } from "vitest";
import { TEXT_NODE } from "../../types";
import { createServerDocumentFragment } from "./document-fragment";
import { createServerElement } from "./element";
import { createServerTextNode } from "./text";

describe("SSR DocumentFragment Behavior", () => {
  it("should act as a portal when using appendChild", () => {
    const parent = createServerElement("div");
    const fragment = createServerDocumentFragment();
    const child1 = createServerTextNode("A");
    const child2 = createServerElement("span");

    fragment.appendChild(child1);
    fragment.appendChild(child2);

    expect(fragment.childNodes.length).toBe(2);
    expect(parent.childNodes.length).toBe(0);

    const result = parent.appendChild(fragment as any);

    // 1. Fragment should be empty
    expect(fragment.childNodes.length).toBe(0);
    // 2. Parent should have the children
    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0]).toBe(child1);
    expect(parent.childNodes[1]).toBe(child2);
    // 3. Child nodes should have new parent
    expect((child1 as any).parentNode).toBe(parent);
    expect((child2 as any).parentNode).toBe(parent);
    // 4. Fragment itself should NOT be a child
    expect(Array.from(parent.childNodes).includes(fragment as any)).toBe(false);
    // 5. Result should be the fragment (standard behavior)
    expect(result).toBe(fragment);
    expect((fragment as any).parentNode).toBeNull();
  });

  it("should act as a portal when using insertBefore", () => {
    const parent = createServerElement("div");
    const existing = createServerElement("span"); // Use Element to avoid text merge
    parent.appendChild(existing);

    const fragment = createServerDocumentFragment();
    const child1 = createServerTextNode("New");
    fragment.appendChild(child1);

    parent.insertBefore(fragment as any, existing);

    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0]).toBe(child1);
    expect(parent.childNodes[1]).toBe(existing);
    expect(Array.from(parent.childNodes).includes(fragment as any)).toBe(false);
  });

  it("should fail if fragment is treated as a normal node", () => {
    const parent = createServerElement("div");
    const fragment = createServerDocumentFragment();

    // Attempt to manually set parent (black-box check)
    // In our implementation, we can't easily force this without using internal props,
    // but we can verify that standard APIs don't do it.

    parent.append(fragment as any);
    expect(Array.from(parent.childNodes).includes(fragment as any)).toBe(false);
  });

  it("should merge text nodes when inserting fragment with text children", () => {
    const parent = createServerElement("div");
    const t1 = createServerTextNode("Hello");
    parent.appendChild(t1);

    const fragment = createServerDocumentFragment();
    const t2 = createServerTextNode(" World");
    fragment.appendChild(t2);

    parent.appendChild(fragment as any);

    // Should merge
    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0].nodeType).toBe(TEXT_NODE);
    expect(parent.childNodes[0].textContent).toBe("Hello World");
    // t2 is consumed/merged but detached
    expect((t2 as any).parentNode).toBeNull();
  });
});
