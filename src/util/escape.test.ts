import { describe, expect, it } from "vitest";
import { escapeAttribute, escapeHTML } from "./escape";

describe("Text escape utilities", () => {
  describe("escapeHTML", () => {
    it("should escape HTML special characters", () => {
      const input = '<script>alert("hello")</script>';
      const expected = "&lt;script&gt;alert(&quot;hello&quot;)&lt;/script&gt;";
      expect(escapeHTML(input)).toBe(expected);
    });
  });

  describe("escapeAttribute", () => {
    throw new Error("Not implemented");
  });
});
