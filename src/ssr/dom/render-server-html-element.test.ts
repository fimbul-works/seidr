import { describe, expect, it } from "vitest";
import { renderClosingTag, renderOpeningTag, VOID_ELEMENTS } from "./render-server-html-element";

describe("Granular Rendering Functions", () => {
  describe("renderOpeningTag", () => {
    it("should render opening tag with attributes", () => {
      expect(renderOpeningTag("div", ['id="test"'])).toBe('<div id="test">');
    });

    it("should render void elements with self-closing slash", () => {
      expect(renderOpeningTag("br", [])).toBe("<br />");
      expect(renderOpeningTag("img", ['src="foo.png"'])).toBe('<img src="foo.png" />');
    });
  });

  describe("renderClosingTag", () => {
    it("should render closing tag for non-void elements", () => {
      expect(renderClosingTag("div")).toBe("</div>");
    });

    it("should render empty string for void elements", () => {
      expect(renderClosingTag("br")).toBe("");
    });
  });

  describe("VOID_ELEMENTS", () => {
    it("should contain standard void elements", () => {
      expect(VOID_ELEMENTS.has("br")).toBe(true);
      expect(VOID_ELEMENTS.has("img")).toBe(true);
      expect(VOID_ELEMENTS.has("div")).toBe(false);
    });
  });
});
