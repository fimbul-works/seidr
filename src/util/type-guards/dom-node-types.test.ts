import { describe, expect, it } from "vitest";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../constants";
import { describeDualMode } from "../../test-setup";
import { isComment, isDOMNode, isHTMLElement, isMarkerComment, isTextNode } from "./dom-node-types";

describeDualMode("DOM Nodes", ({ getDocument }) => {
  describe("isComment", () => {
    it("should return true for comments", () => {
      expect(isComment(getDocument().createComment("comment"))).toBe(true);
    });

    it("should return false for non-comments", () => {
      expect(isComment(getDocument().createTextNode("text"))).toBe(false);
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

  describe("isHTMLElement", () => {
    it("should return true for HTMLElements", () => {
      expect(isHTMLElement(getDocument().createElement("div"))).toBe(true);
    });

    it("should return false for non-HTMLElements", () => {
      expect(isHTMLElement(getDocument().createTextNode("text"))).toBe(false);
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

  describe("isMarkerComment", () => {
    it("should return true for marker comments", () => {
      expect(isMarkerComment(getDocument().createComment(`${SEIDR_COMPONENT_START_PREFIX}Component-1`))).toBe(true);
      expect(isMarkerComment(getDocument().createComment(`${SEIDR_COMPONENT_END_PREFIX}Component-1`))).toBe(true);
    });

    it("should return false for non-marker comments", () => {
      expect(isMarkerComment(getDocument().createTextNode("text"))).toBe(false);
    });
  });
});
