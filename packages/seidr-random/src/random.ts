import { getAppState, getComponentScope, onUnmounted } from "@fimbul-works/seidr";

/** AppState key for storing random number generator state */
export const DATA_KEY_RANDOM = "random.splitmix32";

/**
 * Deterministic random number generator for Seidr using the SplitMix32 algorithm.
 *
 * This function maintains state within the current AppState to provide
 * a sequence of high-entropy pseudo-random numbers that is deterministic
 * across the SSR/Hydration boundary.
 *
 * @returns {number} A random number between 0 and 1.
 */
export const random = (): number => {
  const FRAC = 2 ** -32;
  const LCG_M = 0xefc8249d;

  const appState = getAppState();

  // Get unique RNG ID
  const state = appState.getData<Map<number, number>>(DATA_KEY_RANDOM, new Map());
  let rngId = appState.ctxID;

  const scope = getComponentScope();
  if (scope) {
    rngId = scope.id;
    onUnmounted(() => state.delete(rngId));
  }

  // Seed RNG state
  if (!state.has(rngId)) {
    state.set(rngId, Math.imul(appState.ctxID ^ LCG_M, rngId) >>> 0);
  }

  // Generate next number using the stored state
  let s = state.get(rngId)!;
  s = (s + 0x9e3779b9) | 0;

  let t = Math.imul(s ^ (s >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  t ^= t >>> 15;

  // Save component RNG state
  state.set(rngId, s >>> 0);

  return (t >>> 0) * FRAC;
};
