import { describe, expect, it } from "vitest";
import { kebabToCamel } from "./string";

describe("String Utilities", () => {
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
});
