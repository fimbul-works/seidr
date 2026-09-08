import { getAppState } from "../app-state/app-state.js";
import { getComponentScope } from "../component/lifecycle/component-scope.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";

/** AppState key for storing random number generator state */
export const DATA_KEY_RANDOM = "seidr.random";

/**
 * Deterministic random number generator for Seidr using the SplitMix32 algorithm.
 *
 * This function maintains state within the current AppState to provide
 * a sequence of high-entropy pseudo-random numbers that is deterministic
 * across the SSR/Hydration boundary.
 *
 * @returns {number} A random float between 0 and 1
 */
export const random = (): number => {
  const FRAC = 2 ** -32;
  const LCG_M = 0xefc8249d;

  const appState = getAppState();

  // Ensure SSR boundary data strategy
  if (!appState.getDataStrategy(DATA_KEY_RANDOM)) {
    appState.defineDataStrategy(
      DATA_KEY_RANDOM,
      () => appState.getData(DATA_KEY_RANDOM),
      (data) => appState.setData(DATA_KEY_RANDOM, data),
    );
  }

  // Initialize RNG state
  let rngState = appState.getData<Map<number, number>>(DATA_KEY_RANDOM);
  if (!rngState) {
    rngState = new Map<number, number>();
    appState.setData(DATA_KEY_RANDOM, rngState);
  }

  // Get unique RNG ID
  let rngId: number = appState.ctxID;
  try {
    rngId = getComponentScope()?.nextValueId ?? rngId;
    onUnmounted(() => rngState.delete(rngId));
  } catch {
    // getComponentScope() throws outside component hierarchy — use fallback seed
  }

  // Seed RNG state
  if (!rngState.has(rngId)) {
    rngState.set(rngId, Math.imul(appState.ctxID ^ LCG_M, rngId) >>> 0);
  }

  // Generate next number using the stored state
  let s = rngState.get(rngId)!;
  s = (s + 0x9e3779b9) | 0;

  let t = Math.imul(s ^ (s >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  t ^= t >>> 15;

  // Save component RNG state
  rngState.set(rngId, s);

  return (t >>> 0) * FRAC;
};
