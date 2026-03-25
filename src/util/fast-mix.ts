/** FastMix / FastUnmix constants (32-bit) */
export const FAST_MIX_MUL_32 = 0x45d9f3b;

/**
 * fastMix — High-speed symmetric 32-bit integer mixer.
 * Scrambles one or two numbers into one using multiply-xorshift.
 *
 * @param {number} a - First number to mix
 * @param {number} [b=0] - Optional second number to mix (XORed with a, default: 0)
 * @returns {number} A well-distributed 32-bit unsigned integer
 */
export const fastMix = (a: number, b = 0): number => {
  let x = (a ^ b) >>> 0;
  x = Math.imul(x ^ (x >>> 16), FAST_MIX_MUL_32) >>> 0;
  x = Math.imul(x ^ (x >>> 16), FAST_MIX_MUL_32) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
};
