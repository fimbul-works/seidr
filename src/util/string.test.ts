import { describe, expect, it } from "vitest";
import { camelToKebab, isCamelCase, isKebabCase, kebabToCamel } from "./string";

describe("String Utilities", () => {
  describe("camelToKebab", () => {
    it("should convert camelCase to kebab-case", () => {
      expect(camelToKebab("backgroundColor")).toBe("background-color");
      expect(camelToKebab("fontSize")).toBe("font-size");
      expect(camelToKebab("webkitTransform")).toBe("webkit-transform");
    });

    it("should handle single word lowercase", () => {
      expect(camelToKebab("color")).toBe("color");
    });
  });

  describe("kebabToCamel", () => {
    it("should convert kebab-case to camelCase", () => {
      expect(kebabToCamel("background-color")).toBe("backgroundColor");
      expect(kebabToCamel("font-size")).toBe("fontSize");
      expect(kebabToCamel("webkit-transform")).toBe("webkitTransform");
    });

    it("should handle single word lowercase", () => {
      expect(kebabToCamel("color")).toBe("color");
    });
  });

  describe("isKebabCase", () => {
    it("should return true for valid kebab-case", () => {
      expect(isKebabCase("foo-bar")).toBe(true);
      expect(isKebabCase("a-b-c")).toBe(true);
      expect(isKebabCase("my-custom-element")).toBe(true);
    });

    it("should return true for single lowercase word", () => {
      expect(isKebabCase("foo")).toBe(true);
    });

    it("should return false if it contains uppercase letters", () => {
      expect(isKebabCase("fooBar")).toBe(false);
      expect(isKebabCase("Foo-Bar")).toBe(false);
    });

    it("should return false for invalid formats", () => {
      expect(isKebabCase("foo--bar")).toBe(false);
      expect(isKebabCase("-foo")).toBe(false);
      expect(isKebabCase("foo-")).toBe(false);
      expect(isKebabCase("foo_bar")).toBe(false);
    });
  });

  describe("isCamelCase", () => {
    it("should return true for valid camelCase", () => {
      expect(isCamelCase("fooBar")).toBe(true);
      expect(isCamelCase("myCustomElement")).toBe(true);
      expect(isCamelCase("aBC")).toBe(true);
    });

    it("should return true for single lowercase word", () => {
      expect(isCamelCase("foo")).toBe(true);
    });

    it("should return false if it contains dashes or underscores", () => {
      expect(isCamelCase("foo-bar")).toBe(false);
      expect(isCamelCase("foo_bar")).toBe(false);
    });

    it("should return false if it starts with uppercase", () => {
      expect(isCamelCase("FooBar")).toBe(false);
    });

    it("should return false for mixed invalid formats", () => {
      expect(isCamelCase("this-isNot-valid")).toBe(false);
    });
  });
});
