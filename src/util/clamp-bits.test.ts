import { describe, expect, it } from "vitest";
import { clampBits } from "./clamp-bits.js";
import { SeidrError } from "../types";

describe("clampBits", () => {
  it("should clamp numbers to 20 bits", () => {
    expect(clampBits(0xfffff, 20)).toBe(0xfffff);
    expect(clampBits(0x123456, 20)).toBe(0x23456);
    expect(clampBits(0, 20)).toBe(0);
    expect(clampBits(-1, 20)).toBe(0xfffff); // -1 >>> 0 is 0xFFFFFFFF, clamped to 20 bits is 0xFFFFF
  });

  it("should clamp numbers to 32 bits and return unsigned", () => {
    expect(clampBits(0xffffffff, 32)).toBe(4294967295);
    expect(clampBits(0xfffffffff, 32)).toBe(4294967295);
    expect(clampBits(-1, 32)).toBe(4294967295);
    expect(clampBits(0, 32)).toBe(0);
  });

  it("should throw SeidrError for invalid bits", () => {
    // @ts-expect-error - testing invalid input
    expect(() => clampBits(123, 16)).toThrow(SeidrError);
    // @ts-expect-error - testing invalid input
    expect(() => clampBits(123, 16)).toThrow("clampBits: expected 20 or 32 bits");
  });
});
