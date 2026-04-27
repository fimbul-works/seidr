import { fastMix } from "./fast-mix.js";

/** TextEncoder instance for encoding strings to bytes */
const textEncoder = new TextEncoder();

/**
 * fastMixHash — fast, non-cryptographic streaming hash.
 *
 * @param {unknown} data - The input data to hash
 * @param {number} seed - Optional seed (default: 0)
 * @returns {number} A 32-bit unsigned hash
 */
export const fastMixHash = (data: unknown, seed = 0): number => {
  const bytes = textEncoder.encode(String(data));
  const len = bytes.length;
  let state = seed >>> 0;
  let i = 0;

  while (i + 8 <= len) {
    const lo = (bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)) >>> 0;
    const hi = (bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24)) >>> 0;
    state = fastMix(state ^ lo, hi);
    i += 8;
  }

  // Remaining bytes (up to 7): pack into two 32-bit words
  if (i < len) {
    let lo = 0;
    let hi = 0;
    const rem = len - i;
    for (let j = 0; j < Math.min(4, rem); j++) {
      lo |= bytes[i + j] << (j * 8);
    }
    for (let j = 4; j < rem; j++) {
      hi |= bytes[i + j] << ((j - 4) * 8);
    }
    state = fastMix(state ^ (lo >>> 0), hi >>> 0);
  }

  // Mix in length for domain separation (prevents "abc\0" ≡ "abc" collisions)
  return fastMix(state, len) >>> 0;
};
