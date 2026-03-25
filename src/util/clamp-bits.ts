import { SeidrError } from "../types";

const MASK_20 = (1 << 20) - 1;

type ClampBits = 20 | 32;

/**
 * Clamp a 32-bit hash to a specific number of bits.
 * @param {number} hash - The hash to clamp
 * @param {ClampBits} bits - The number of bits to clamp to (20 or 32)
 * @returns {number} The clamped hash
 */
export const clampBits = (hash: number, bits: ClampBits): number => {
  if (bits === 20) return (hash >>> 0) & MASK_20;
  if (bits === 32) return hash >>> 0;
  throw new SeidrError(`clampBits: expected 20 or 32 bits (got ${bits})`);
};
