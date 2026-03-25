import { SeidrError } from "../types";

/** Mask for 24-bit integers */
const MASK_24 = (1 << 24) - 1;

/** The number of bits to clamp to */
type ClampBits = 24 | 32;

/**
 * Clamp a 32-bit hash to a specific number of bits.
 * @param {number} hash - The hash to clamp
 * @param {ClampBits} bits - The number of bits to clamp to (24 or 32)
 * @returns {number} The clamped hash
 */
export const clampBits = (hash: number, bits: ClampBits = 24): number => {
  if (bits === 24) return (hash >>> 0) & MASK_24;
  if (bits === 32) return hash >>> 0;
  throw new SeidrError(`clampBits: expected 24 or 32 bits (got ${bits})`);
};
