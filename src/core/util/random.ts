import { getRenderContext } from "../render-context-contract";

/** 2^-32 - the smallest possible decimal number (1 / 4294967296) */
const FRAC = 2 ** -32;
/** Linear Congruential Generator constant for state initialization */
const LCG_M = 4022871197;
/** Multiplier for the Alea generation step */
const ALEA_M = 2091639;

/**
 * Deterministic random number generator for Seidr.
 *
 * This function maintains state within the current RenderContext to provide
 * a sequence of high-entropy pseudo-random numbers that is deterministic
 * across the SSR/Hydration boundary.
 *
 * Original work copyright © 2010 Johannes Baagøe, under MIT license
 *
 * @returns {number} A random float between 0 and 1.
 */
export function random(): number {
  const ctx = getRenderContext();
  if (!ctx) return Math.random();

  // Initialize state if not present
  if (!ctx.randomState) {
    // We use the ID and initial counter to seed the sequence
    const seed = ctx.renderContextID + ctx.randomCounter;
    let r0: number, r1: number, r2: number, i: number;

    const s = seed < 1 ? 1 / seed : seed;
    r0 = (s >>> 0) * FRAC;
    const s1 = (s * LCG_M + 1) >>> 0;
    r1 = s1 * FRAC;
    const s2 = (s1 * LCG_M + 1) >>> 0;
    r2 = s2 * FRAC;
    i = 1;

    ctx.randomState = [r0, r1, r2, i];
  }

  // Generate next number using the stored state
  let [r0, r1, r2, i] = ctx.randomState;
  const t = ALEA_M * r0 + i * FRAC;
  r0 = r1;
  r1 = r2;
  i = t | 0;
  r2 = t - i;

  // Save the state back to context
  ctx.randomState = [r0, r1, r2, i];

  return r2;
}
