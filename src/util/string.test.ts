import { describe, expect, it } from "vitest";
import { camelToKebab } from "./string";

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
});
