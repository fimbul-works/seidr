import { encodeBase62 } from "@fimbul-works/futhark";
import { getAppState } from "../app-state";

// Data-key for unique ID counters
export const DATA_KEY_ID = "seidr.id";

/**
 * Creates a unique identifier with an optional prefix.
 *
 * @param {string} [prefix=""] - Optional prefix to prepend to the identifier.
 * @returns {string} The unique identifier.
 */
export function useId(prefix: string = ""): string {
  const appState = getAppState();

  // Ensure SSR boundary data strategy
  if (!process.env.SEIDR_DISABLE_SSR) {
    if (!appState.getDataStrategy(DATA_KEY_ID)) {
      appState.defineDataStrategy(
        DATA_KEY_ID,
        () => Array.from(appState.getData<Map<string, number>>(DATA_KEY_ID)?.entries() ?? []),
        (data: [string, number][]) => appState.setData(DATA_KEY_ID, new Map(data.map(([k, v]) => [k, Number(v)]))),
      );
    }
  }

  const counters = appState.getData<Map<string, number>>(DATA_KEY_ID, new Map());
  const nextId = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, nextId);

  return (prefix ? `${prefix}-` : "") + encodeBase62(nextId);
}

/**
 * Resets ID counters.
 *
 * @internal Used for testing.
 */
export function resetIdCounters() {
  getAppState().deleteData(DATA_KEY_ID);
}
