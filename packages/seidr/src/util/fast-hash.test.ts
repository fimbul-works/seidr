import { describe, expect, it } from "vitest";
import { fastHash } from "./fast-hash.js";

describe("fastHash", () => {
  it("should produce consistent results", () => {
    expect(fastHash("hello")).toBe(fastHash("hello"));
    expect(fastHash("hello", 123)).toBe(fastHash("hello", 123));
    expect(fastHash("hello")).not.toBe(fastHash("world"));
  });

  it("should be sensitive to seed differences", () => {
    expect(fastHash("hello", 0)).not.toBe(fastHash("hello", 1));
  });

  it("should handle different lengths and empty string", () => {
    const inputs = ["", "a", "abc", "abcd", "abcde", "abcdefg", "abcdefgh", "abcdefgh i", "abcdefghijklmnopqrstuvwxyz"];
    for (const input of inputs) {
      const hash = fastHash(input);
      expect(typeof hash).toBe("number");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    }
    expect(fastHash("")).not.toBe(fastHash(" "));
  });

  it("should handle non-ASCII characters (UTF-8)", () => {
    const s1 = "héllo";
    const s2 = "hello";
    expect(fastHash(s1)).not.toBe(fastHash(s2));
    expect(fastHash("你好")).toBe(fastHash("你好"));
  });

  it("should avoid simple length-based collisions (abc\\0 vs abc)", () => {
    // The implementation mixes in length at the end, which helps here
    expect(fastHash("abc\0")).not.toBe(fastHash("abc"));
  });

  it("should handle very long strings", () => {
    const longString = "a".repeat(10000);
    expect(typeof fastHash(longString)).toBe("number");
    expect(fastHash(longString)).toBe(fastHash("a".repeat(10000)));
  });
});
