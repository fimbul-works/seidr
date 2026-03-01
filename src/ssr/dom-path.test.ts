import { describe, expect, it } from "vitest";
import { createServerDocument, createServerElement, createServerTextNode } from "./dom";
import { getRelativeDOMPath } from "./dom-path";

describe("getRelativeDOMPath", () => {
  it("should calculate correct path in a simple tree", () => {
    const doc = createServerDocument() as any;
    const root = createServerElement("div", doc);
    const span = createServerElement("span", doc);
    const text = createServerTextNode("hello", doc);

    root.appendChild(span);
    span.appendChild(text);

    expect(getRelativeDOMPath(root, span)).toEqual([0]);
    expect(getRelativeDOMPath(root, text)).toEqual([0, 0]);
  });

  it("should ignore whitespace text nodes", () => {
    const doc = createServerDocument() as any;
    const root = createServerElement("div", doc);
    const ws = createServerTextNode("  \n  ", doc);
    const span = createServerElement("span", doc);

    root.appendChild(ws);
    root.appendChild(span);

    // index should be 0, because ws is ignored
    expect(getRelativeDOMPath(root, span)).toEqual([0]);
  });

  it("should NOT ignore whitespace in <pre>", () => {
    const doc = createServerDocument() as any;
    const pre = createServerElement("pre", doc);
    const ws = createServerTextNode("  ", doc);
    const span = createServerElement("span", doc);

    pre.appendChild(ws);
    pre.appendChild(span);

    // index should be 1, because ws is significant in <pre>
    expect(getRelativeDOMPath(pre, span)).toEqual([1]);
  });

  it("should handle anchorSibling for markers", () => {
    const doc = createServerDocument() as any;
    const root = createServerElement("div", doc);
    const marker = doc.createComment("start");
    const other = createServerElement("p", doc) as any;
    const target = createServerElement("span", doc);

    root.appendChild(other);
    root.appendChild(marker);
    root.appendChild(target);

    // Path relative to root normally would be [2]
    // but we skip the "p" so [1] (if ws was there)
    // Actually "p" is not ignorable.

    // If we use marker as anchorSibling, it should be [0]
    expect(getRelativeDOMPath(root, target, marker)).toEqual([0]);
  });
});
