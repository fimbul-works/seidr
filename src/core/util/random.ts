import { getRenderContext } from "../render-context-contract";

/** 2^-32 - the smallest possible decimal number (1 / 4294967296) */
const FRAC = 2 ** -32;
/** Linear Congruential Generator constant for state initialization */
const LCG_M = 4022871197;
/** Multiplier for the Alea generation step */
const ALEA_M = 2091639;

/**
 * Deterministic random number generator for Seidr using the Alea algorithm.
 *
 * This function maintains state within the current RenderContext to provide
 * a sequence of high-entropy pseudo-random numbers that is deterministic
 * across the SSR/Hydration boundary.
 *
 * Original work copyright © 2010 Johannes Baagøe, under MIT license.
 *
 * @returns {number} A random float between 0 and 1
 */
export function random(): number {
  const ctx = getRenderContext();
  if (!ctx) return Math.random();

  // Initialize state if not present
  if (!ctx.randomState) {
    // We use the ID and initial counter to seed the sequence
    // Adding an offset ensures high entropy even for seed 0
    const seed = ctx.renderContextID + ctx.randomCounter + (LCG_M / 1);
    const s0 = (seed * LCG_M + 1) >>> 0;
    const s1 = (s0 * LCG_M + 1) >>> 0;
    const s2 = (s1 * LCG_M + 1) >>> 0;
    ctx.randomState = [s0 * FRAC, s1 * FRAC, s2 * FRAC, 1];
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
