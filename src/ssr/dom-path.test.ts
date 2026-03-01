import { describe, expect, it } from "vitest";
import { SSRDocument } from "./dom";
import { getRelativeDOMPath } from "./dom-path";

describe("getRelativeDOMPath", () => {
  it("should calculate correct path in a simple tree", () => {
    const doc = new SSRDocument();
    const root = doc.createElement("div");
    const span = doc.createElement("span");
    const text = doc.createTextNode("hello");

    root.appendChild(span);
    span.appendChild(text);

    expect(getRelativeDOMPath(root, span)).toEqual([0]);
    expect(getRelativeDOMPath(root, text)).toEqual([0, 0]);
  });

  it("should ignore whitespace text nodes", () => {
    const doc = new SSRDocument();
    const root = doc.createElement("div");
    const ws = doc.createTextNode("  \n  ");
    const span = doc.createElement("span");

    root.appendChild(ws);
    root.appendChild(span);

    // index should be 0, because ws is ignored
    expect(getRelativeDOMPath(root, span)).toEqual([0]);
  });

  it("should NOT ignore whitespace in <pre>", () => {
    const doc = new SSRDocument();
    const pre = doc.createElement("pre");
    const ws = doc.createTextNode("  ");
    const span = doc.createElement("span");

    pre.appendChild(ws);
    pre.appendChild(span);

    // index should be 1, because ws is significant in <pre>
    expect(getRelativeDOMPath(pre, span)).toEqual([1]);
  });

  it("should handle anchorSibling for markers", () => {
    const doc = new SSRDocument();
    const root = doc.createElement("div");
    const marker = doc.createComment("start");
    const other = doc.createElement("p");
    const target = doc.createElement("span");

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
