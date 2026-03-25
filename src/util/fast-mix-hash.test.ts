import { describe, expect, it } from "vitest";
import { fastMixHash } from "./fast-mix-hash.js";

describe("fastMixHash", () => {
  it("should produce consistent results", () => {
    expect(fastMixHash("hello")).toBe(fastMixHash("hello"));
    expect(fastMixHash("hello", 123)).toBe(fastMixHash("hello", 123));
    expect(fastMixHash("hello")).not.toBe(fastMixHash("world"));
  });

  it("should be sensitive to seed differences", () => {
    expect(fastMixHash("hello", 0)).not.toBe(fastMixHash("hello", 1));
  });

  it("should handle different lengths and empty string", () => {
    const inputs = ["", "a", "abc", "abcd", "abcde", "abcdefg", "abcdefgh", "abcdefgh i", "abcdefghijklmnopqrstuvwxyz"];
    for (const input of inputs) {
      const hash = fastMixHash(input);
      expect(typeof hash).toBe("number");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    }
    expect(fastMixHash("")).not.toBe(fastMixHash(" "));
  });

  it("should handle non-ASCII characters (UTF-8)", () => {
    const s1 = "héllo";
    const s2 = "hello";
    expect(fastMixHash(s1)).not.toBe(fastMixHash(s2));
    expect(fastMixHash("你好")).toBe(fastMixHash("你好"));
  });

  it("should avoid simple length-based collisions (abc\\0 vs abc)", () => {
    // The implementation mixes in length at the end, which helps here
    expect(fastMixHash("abc\0")).not.toBe(fastMixHash("abc"));
  });

  it("should handle very long strings", () => {
    const longString = "a".repeat(10000);
    expect(typeof fastMixHash(longString)).toBe("number");
    expect(fastMixHash(longString)).toBe(fastMixHash("a".repeat(10000)));
  });
});
