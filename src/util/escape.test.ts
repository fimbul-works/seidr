import { describe, expect, it } from "vitest";
import { escapeAttribute, escapeHTML } from "./escape";

describe("escape", () => {
  describe("escapeHTML", () => {
    it("should escape special characters", () => {
      expect(escapeHTML("<div class='test'>&</div>")).toBe("&lt;div class=&#039;test&#039;&gt;&amp;&lt;/div&gt;");
    });

    it("should handle non-string values", () => {
      expect(escapeHTML(123 as any)).toBe("123");
      expect(escapeHTML(true as any)).toBe("true");
    });
  });

  describe("escapeAttribute", () => {
    it('should escape & and "', () => {
      expect(escapeAttribute('test & "value"')).toBe("test &amp; &quot;value&quot;");
    });

    it("should NOT escape < and > since they are fine in attributes unless they start the tag", () => {
      // Actually browsers might escape them, but our implementation doesn't.
      expect(escapeAttribute("< >")).toBe("< >");
    });
  });
});
