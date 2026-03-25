import { expect, it, describe } from "vitest";
import { fastMix } from "./fast-mix.js";

describe("fastMix", () => {
  it("should be consistent", () => {
    expect(fastMix(123)).toBe(fastMix(123));
    expect(fastMix(123, 456)).toBe(fastMix(123, 456));
  });

  it("should be sensitive to differences in input", () => {
    expect(fastMix(123)).not.toBe(fastMix(124));
    expect(fastMix(123, 456)).not.toBe(fastMix(123, 457));
    expect(fastMix(123, 456)).not.toBe(fastMix(124, 456));
  });

  it("should return a 32-bit unsigned integer", () => {
    const result = fastMix(0xffffffff, 0xffffffff);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("should handle 0 and large numbers", () => {
    expect(typeof fastMix(0, 0)).toBe("number");
    expect(typeof fastMix(0xffffffff, 1)).toBe("number");
  });

  it("should be symmetric for a and b (XOR property)", () => {
    // fastMix(a, b) should be same as fastMix(b, a) because it starts with a ^ b
    expect(fastMix(0x1234, 0x5678)).toBe(fastMix(0x5678, 0x1234));
  });
});
