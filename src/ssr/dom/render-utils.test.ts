import { describe, expect, it } from "vitest";
import { wrapSeidr } from "../../seidr";
import { camelToKebab, renderAttribute, renderDataset, renderStyle } from "./render-utils";

describe("SSR Render Utils", () => {
  describe("camelToKebab", () => {
    it("should convert camelCase to kebab-case", () => {
      expect(camelToKebab("backgroundColor")).toBe("background-color");
      expect(camelToKebab("fontSize")).toBe("font-size");
      expect(camelToKebab("webkitTransform")).toBe("-webkit-transform");
    });
  });

  describe("renderStyle", () => {
    it("should render string style", () => {
      expect(renderStyle("color: red;")).toBe("color: red;");
    });

    it("should render object style", () => {
      expect(renderStyle({ color: "red", fontSize: "12px" })).toBe("color:red;font-size:12px");
    });

    it("should unwrap Seidr values", () => {
      const color = wrapSeidr("red");
      expect(renderStyle({ color })).toBe("color:red");
    });
  });

  describe("renderDataset", () => {
    it("should render dataset to data- attributes", () => {
      const dataset = { userId: "123", active: true, hidden: false };
      const rendered = renderDataset(dataset);
      expect(rendered).toContain('data-user-id="123"');
      expect(rendered).toContain("data-active");
      expect(rendered).not.toContain("data-hidden");
    });

    it("should keep data- prefix if present", () => {
      const dataset = { "data-custom": "value" };
      expect(renderDataset(dataset)).toContain('data-custom="value"');
    });
  });

  describe("renderAttribute", () => {
    it("should render basic attributes", () => {
      expect(renderAttribute("id", "my-id")).toBe('id="my-id"');
    });

    it("should render boolean attributes", () => {
      expect(renderAttribute("disabled", true)).toBe("disabled");
      expect(renderAttribute("disabled", false)).toBeNull();
    });

    it("should convert className to class", () => {
      expect(renderAttribute("className", "foo bar")).toBe('class="foo bar"');
    });

    it("should escape attribute values", () => {
      expect(renderAttribute("title", 'He said "Hello"')).toBe('title="He said &quot;Hello&quot;"');
    });
  });
});
