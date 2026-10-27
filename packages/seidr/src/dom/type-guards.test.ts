import { describe, expect, it } from "vitest";
import { describeDualMode } from "../test-setup";
import { isCommentNode, isDOMNode, isElementNode, isTextNode } from "./type-guards";

describeDualMode("DOM Nodes", ({ getDocument }) => {
  describe("isCommentNode", () => {
    it("should return true for comments", () => {
      expect(isCommentNode(getDocument().createComment("comment"))).toBe(true);
    });

    it("should return false for non-comments", () => {
      expect(isCommentNode(getDocument().createTextNode("text"))).toBe(false);
    });
  });

  describe("isDOMNode", () => {
    it("should return true for DOM nodes", () => {
      expect(isDOMNode(getDocument().createComment("comment"))).toBe(true);
      expect(isDOMNode(getDocument().createTextNode("text"))).toBe(true);
      expect(isDOMNode(getDocument().createElement("div"))).toBe(true);
    });

    it("should return false for non-DOM nodes", () => {
      expect(isDOMNode({})).toBe(false);
      expect(isDOMNode(null)).toBe(false);
      expect(isDOMNode(undefined)).toBe(false);
    });
  });

  describe("isElementNode", () => {
    it("should return true for HTMLElements", () => {
      expect(isElementNode(getDocument().createElement("div"))).toBe(true);
    });

    it("should return false for non-HTMLElements", () => {
      expect(isElementNode(getDocument().createTextNode("text"))).toBe(false);
    });
  });

  describe("isTextNode", () => {
    it("should return true for Text nodes", () => {
      expect(isTextNode(getDocument().createTextNode("text"))).toBe(true);
    });

    it("should return false for non-Text nodes", () => {
      expect(isTextNode(getDocument().createComment("comment"))).toBe(false);
    });
  });
});
