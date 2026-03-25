import { describe, expect, it } from "vitest";
import { SeidrError } from "../types";
import { decodeBase62, encodeBase62 } from "./base62.js";

describe("base62", () => {
  describe("encodeBase62", () => {
    it("should encode 0 correctly", () => {
      expect(encodeBase62(0)).toBe("0");
    });

    it("should encode small numbers correctly", () => {
      expect(encodeBase62(1)).toBe("1");
      expect(encodeBase62(10)).toBe("a");
      expect(encodeBase62(61)).toBe("Z");
    });

    it("should encode multi-digit numbers correctly", () => {
      expect(encodeBase62(62)).toBe("10");
      expect(encodeBase62(3843)).toBe("ZZ"); // 61 * 62^1 + 61 * 62^0 = 3782 + 61 = 3843
      expect(encodeBase62(3844)).toBe("100"); // 62^2
    });

    it("should encode large 32-bit integers correctly", () => {
      // 0xFFFFFFFF = 4294967295
      expect(encodeBase62(0xffffffff)).toBe("4GFfc3");
    });
  });

  describe("decodeBase62", () => {
    it("should decode single digits correctly", () => {
      expect(decodeBase62("0")).toBe(0);
      expect(decodeBase62("a")).toBe(10);
      expect(decodeBase62("Z")).toBe(61);
    });

    it("should decode multi-digit strings correctly", () => {
      expect(decodeBase62("10")).toBe(62);
      expect(decodeBase62("ZZ")).toBe(3843);
      expect(decodeBase62("100")).toBe(3844);
    });

    it("should decode large strings correctly", () => {
      expect(decodeBase62("4GFfc3")).toBe(0xffffffff);
    });

    it("should throw SeidrError for invalid characters", () => {
      expect(() => decodeBase62("abc#123")).toThrow(SeidrError);
      expect(() => decodeBase62("abc#123")).toThrow("Invalid base-62 character: #");
    });
  });

  describe("round-trip", () => {
    it("should satisfy round-trip property for various numbers", () => {
      const numbers = [0, 1, 61, 62, 123, 3843, 3844, 1000000, 0x7fffffff, 0xffffffff];
      for (const n of numbers) {
        expect(decodeBase62(encodeBase62(n))).toBe(n);
      }
    });
  });
});
