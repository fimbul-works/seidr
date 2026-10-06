import { describe, expect, it } from "vitest";
import { TYPE_DOCUMENT } from "../../constants";
import { SSRDocument } from "./index";

describe("ServerDocument", () => {
  it("should have basic structure", () => {
    const doc = new SSRDocument();
    expect(doc.nodeType).toBe(TYPE_DOCUMENT);
    expect(doc.documentElement.tagName).toBe("HTML");
    expect(doc.head.tagName).toBe("HEAD");
    expect(doc.body.tagName).toBe("BODY");
  });

  it("should create elements with ownerDocument", () => {
    const doc = new SSRDocument();
    const el = doc.createElement("div");
    expect(el.ownerDocument).toBe(doc);
  });

  it("should create text and comment nodes", () => {
    const doc = new SSRDocument();
    const text = doc.createTextNode("hello");
    expect(text.nodeType).toBe(3); // TYPE_TEXT
    expect(text.textContent).toBe("hello");

    const comment = doc.createComment("world");
    expect(comment.nodeType).toBe(8); // TYPE_COMMENT
    expect(comment.textContent).toBe("world");
  });

  it("should stringify to a full document", () => {
    const doc = new SSRDocument();
    doc.body.innerHTML = "<h1>Hello</h1>";
    const str = doc.toString();
    expect(str).toBe("<html><head></head><body><h1>Hello</h1></body></html>");
  });
});
