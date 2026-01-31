import { getRenderContext } from "../render-context";
import { Seidr, unwrapSeidr } from "../seidr";
import { createStateKey, globalStates, symbolNames } from "../state";
import { isSeidr } from "../util/type-guards";

const SEIDR_PREFIX = "$/";

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 *
 * @param {number} ctxID - Render context ID
 * @returns {boolean} `true` if the renderScopeState existed, `false` otherwise
 */
export const clearRenderContextState = (ctxID: number) => globalStates.delete(ctxID);

/**
 * Captures all state values for a render context during SSR.
 *
 * This function iterates through all state values stored for the given render context,
 * and captures both Seidr observables and plain values. Seidr observable keys are
 * prefixed with "$/" and use numeric IDs, while plain values use their numeric IDs directly.
 *
 * @param {number} ctxID - Render context ID
 * @returns {Record<string, unknown>} Object mapping numeric IDs to values (Seidr keys prefixed with "$/")
 */
export function captureRenderContextState(ctxID: number): Record<string, unknown> {
  const ctxStates = globalStates.get(ctxID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, unknown> = {};

  // Get reverse mapping of symbol to name
  const symbolToName = new Map<symbol, string>();
  for (const [name, sym] of symbolNames.entries()) {
    symbolToName.set(sym, name);
  }

  // Iterate through all state values
  for (const [symbol, value] of ctxStates.entries()) {
    // Skip derived Seidr instances
    if (isSeidr(value) && value.isDerived) continue;

    // Find the name for this symbol
    const name = symbolToName.get(symbol);
    if (!name) continue;

    // Prefix Seidr observable keys with "$/"
    const stateKey = isSeidr(value) ? `${SEIDR_PREFIX}${name}` : name;
    captured[stateKey] = unwrapSeidr(value);
  }

  return captured;
}

/**
 * Restores state values for a render context during hydration.
 *
 * This function takes the captured state from SSR and restores it to the
 * render context's state storage. Keys prefixed with "$/" are automatically
 * wrapped in Seidr observables, while other numeric keys are stored as plain values.
 *
 * @param {Record<string, unknown>} state - Record of numeric IDs to values from SSR
 */
export function restoreGlobalState(state: Record<string, unknown>): void {
  const ctx = getRenderContext();
  const { ctxID = 0 } = ctx ?? {};

  // Ensure the render context has a state storage
  if (!globalStates.has(ctxID)) {
    globalStates.set(ctxID, new Map());
  }

  const ctxStates = globalStates.get(ctxID)!;

  // Iterate through the captured state
  for (const [key, value] of Object.entries(state)) {
    // Check if key is prefixed with "$/" (Seidr observable)
    const isSeidrValue = key.startsWith(SEIDR_PREFIX);
    const name = isSeidrValue ? key.slice(SEIDR_PREFIX.length) : key;

    // Resolve or create symbol for this name
    const targetSymbol = createStateKey(name);

    // Check if there's already a state value for this symbol
    const existingValue = ctxStates.get(targetSymbol);

    if (isSeidrValue) {
      // Handle Seidr observable
      if (isSeidr(existingValue)) {
        // Update existing Seidr instance
        existingValue.value = value;
      } else {
        // Create new Seidr instance
        ctxStates.set(targetSymbol, new Seidr(value));
      }
    } else {
      // Handle plain value - store as-is
      ctxStates.set(targetSymbol, value);
    }
  }
}
