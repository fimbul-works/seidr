import { fastMix } from "@fimbul-works/hash";

/** TextEncoder instance for encoding strings to bytes */
const textEncoder = new TextEncoder();

/**
 * fastHash — fast, non-cryptographic streaming hash.
 *
 * @param {unknown} data - The input data to hash
 * @param {number} seed - Optional seed (default: `0`)
 * @returns {number} A 32-bit unsigned hash
 */
export const fastHash = (data: unknown, seed = 0): number => {
  const bytes = textEncoder.encode(JSON.stringify(data));
  const len = bytes.length;
  let h = 0x6a09e667 ^ len;

  for (let i = 0; i < len; i++) {
    h = fastMix(bytes[i], h);
  }

  return fastMix(h, seed) >>> 0;
};
