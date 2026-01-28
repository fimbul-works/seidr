import { describe, expect, it } from "vitest";
import { decodeBase62, decodeNumber, encodeBase62, encodeNumber, randomString } from "./encode-number";

describe("encode-number utilities", () => {
  describe("encodeNumber", () => {
    it("should encode binary (base 2)", () => {
      const alphabet = "01";
      expect(encodeNumber(0, alphabet)).toBe("0");
      expect(encodeNumber(1, alphabet)).toBe("1");
      expect(encodeNumber(2, alphabet)).toBe("10");
      expect(encodeNumber(5, alphabet)).toBe("101");
      expect(encodeNumber(255, alphabet)).toBe("11111111");
    });

    it("should encode hex (base 16)", () => {
      const alphabet = "0123456789abcdef";
      expect(encodeNumber(0, alphabet)).toBe("0");
      expect(encodeNumber(10, alphabet)).toBe("a");
      expect(encodeNumber(16, alphabet)).toBe("10");
      expect(encodeNumber(255, alphabet)).toBe("ff");
      expect(encodeNumber(4096, alphabet)).toBe("1000");
    });

    it("should encode base 62", () => {
      const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      expect(encodeNumber(0, alphabet)).toBe("0");
      expect(encodeNumber(61, alphabet)).toBe("Z");
      expect(encodeNumber(62, alphabet)).toBe("10");
      expect(encodeNumber(3843, alphabet)).toBe("ZZ"); // 61 * 62 + 61
    });

    it("should encode base 63 (with underscore)", () => {
      const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
      expect(alphabet.length).toBe(63);
      expect(encodeNumber(62, alphabet)).toBe("_");
      expect(encodeNumber(63, alphabet)).toBe("10");
    });

    it("should handle large numbers", () => {
      const alphabet = "0123456789";
      const largeNum = 1234567890;
      expect(encodeNumber(largeNum, alphabet)).toBe("1234567890");
    });
  });

  describe("decodeNumber", () => {
    it("should decode binary (base 2)", () => {
      const alphabet = "01";
      expect(decodeNumber("0", alphabet)).toBe(0);
      expect(decodeNumber("1", alphabet)).toBe(1);
      expect(decodeNumber("10", alphabet)).toBe(2);
      expect(decodeNumber("101", alphabet)).toBe(5);
      expect(decodeNumber("11111111", alphabet)).toBe(255);
    });

    it("should decode hex (base 16)", () => {
      const alphabet = "0123456789abcdef";
      expect(decodeNumber("0", alphabet)).toBe(0);
      expect(decodeNumber("a", alphabet)).toBe(10);
      expect(decodeNumber("10", alphabet)).toBe(16);
      expect(decodeNumber("ff", alphabet)).toBe(255);
      expect(decodeNumber("1000", alphabet)).toBe(4096);
    });

    it("should throw error for invalid characters", () => {
      const alphabet = "0123456789";
      expect(() => decodeNumber("12a", alphabet)).toThrow("Invalid base-10 character: a");
    });

    it("should decode base 63", () => {
      const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
      expect(decodeNumber("_", alphabet)).toBe(62);
      expect(decodeNumber("10", alphabet)).toBe(63);
    });

    it("should be inverse of encodeNumber", () => {
      const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
      for (let i = 0; i < 1000; i++) {
        const num = Math.floor(Math.random() * 1000000);
        const encoded = encodeNumber(num, alphabet);
        expect(decodeNumber(encoded, alphabet)).toBe(num);
      }
    });
  });

  describe("Base-62 convenience functions", () => {
    it("should encode numbers to base 62", () => {
      expect(encodeBase62(0)).toBe("0");
      expect(encodeBase62(61)).toBe("Z");
      expect(encodeBase62(62)).toBe("10");
    });

    it("should decode base 62 strings to numbers", () => {
      expect(decodeBase62("0")).toBe(0);
      expect(decodeBase62("Z")).toBe(61);
      expect(decodeBase62("10")).toBe(62);
    });
  });

  describe("randomString", () => {
    it("should generate string of specified length", () => {
      expect(randomString(0).length).toBe(0);
      expect(randomString(5).length).toBe(5);
      expect(randomString(10).length).toBe(10);
    });

    it("should use the specified alphabet", () => {
      const alphabet = "abc";
      const result = randomString(100, alphabet);
      for (const char of result) {
        expect(alphabet.includes(char)).toBe(true);
      }
    });

    it("should use the provided random function", () => {
      const alphabet = "0123456789";
      // A "random" generator that always returns 0.5 (points to '5')
      const mockRandom = () => 0.5;
      expect(randomString(5, alphabet, mockRandom)).toBe("55555");

      // A generator that always returns 0.999 (points to '9')
      const mockRandomEnd = () => 0.999;
      expect(randomString(3, alphabet, mockRandomEnd)).toBe("999");
    });

    it("should default to base-62 alphabet", () => {
      const result = randomString(50);
      const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const char of result) {
        expect(base62.includes(char)).toBe(true);
      }
    });
  });
});
