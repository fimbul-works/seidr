import { describe, expect, it } from "vitest";
import { SeidrError } from "../types";
import { clampBits } from "./clamp-bits.js";

describe("clampBits", () => {
  it("should clamp numbers to 24 bits", () => {
    expect(clampBits(0xfffff, 24)).toBe(0xfffff);
    expect(clampBits(0x123456, 24)).toBe(0x123456);
    expect(clampBits(0, 24)).toBe(0);
    expect(clampBits(-1, 24)).toBe(0xffffff); // -1 >>> 0 is 0xFFFFFFFF, clamped to 24 bits is 0xFFFFFF
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
    expect(() => clampBits(123, 16)).toThrow("clampBits: expected 24 or 32 bits");
  });
});
