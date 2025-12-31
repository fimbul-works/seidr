import { getRenderContext } from "../core/render-context-contract";
import { globalStates } from "../core/state";
import { Seidr } from "../core/seidr";
import { isSeidr } from "../core/util/is";
import { symbolNames } from "../core/state";

const SEIDR_PREFIX = "$/";

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 *
 * @param renderContextID - Render context ID
 * @returns true if the renderScopeState existed, false otherwise
 */
export const clearRenderContextState = (renderContextID: number) => globalStates.delete(renderContextID);

/**
 * Captures all state values for a render context during SSR.
 *
 * This function iterates through all state values stored for the given render context,
 * and captures both Seidr observables and plain values. Seidr observable keys are
 * prefixed with "$/" and use numeric IDs, while plain values use their numeric IDs directly.
 *
 * @param renderContextID - Render context ID
 * @returns Object mapping numeric IDs to values (Seidr keys prefixed with "$/")
 *
 * @example
 * ```typescript
 * // During SSR
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 * const SETTINGS_KEY = createStateKey<{ theme: string }>("settings");
 *
 * setState(USER_KEY, new Seidr("Alice"));
 * setState(SETTINGS_KEY, { theme: "dark" });
 *
 * const state = captureRenderContextState(ctx.renderContextID);
 * // Returns: { "$/0": "Alice", "1": { theme: "dark" } }
 * // Where 0 is the numeric ID for "user" and 1 is for "settings"
 * ```
 */
export function captureRenderContextState(renderContextID: number): Record<string, unknown> {
  const ctxStates = globalStates.get(renderContextID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, unknown> = {};

  // Get all symbol names in order to map symbols to numeric IDs
  const symbolNamesArray = Array.from(symbolNames.entries());

  // Iterate through all state values
  for (const [symbol, value] of ctxStates.entries()) {
    // Skip derived Seidr instances
    if (isSeidr(value) && value.isDerived) continue;

    // Find the numeric ID for this symbol
    const id = symbolNamesArray.findIndex(([, sym]) => sym === symbol);
    if (id === -1) continue;

    // Prefix Seidr observable keys with "$/"
    const stateKey = isSeidr(value) ? `${SEIDR_PREFIX}${id}` : String(id);
    captured[stateKey] = isSeidr(value) ? value.value : value;
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
 * @param state - Record of numeric IDs to values from SSR
 *
 * @example
 * ```typescript
 * // During hydration
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 * const SETTINGS_KEY = createStateKey<{ theme: string }>("settings");
 *
 * restoreGlobalState({
 *   "$/0": "Alice",      // 0 is the numeric ID for "user"
 *   "1": { theme: "dark" } // 1 is the numeric ID for "settings"
 * });
 *
 * const user = getState<Seidr<string>>(USER_KEY);
 * // user.value is now "Alice" (automatically wrapped in Seidr)
 *
 * const settings = getState<{ theme: string }>(SETTINGS_KEY);
 * // settings is { theme: "dark" } (plain value)
 * ```
 */
export function restoreGlobalState(state: Record<string, unknown>): void {
  const ctx = getRenderContext();
  const { renderContextID = 0 } = ctx ?? {};

  // Ensure the render context has a state storage
  if (!globalStates.has(renderContextID)) {
    globalStates.set(renderContextID, new Map());
  }

  const ctxStates = globalStates.get(renderContextID)!;

  // Get all symbol names in order to map numeric IDs to symbols
  const symbolNamesArray = Array.from(symbolNames.entries());

  // Iterate through the captured state
  for (const [key, value] of Object.entries(state)) {
    // Check if key is prefixed with "$/" (Seidr observable)
    const isSeidrValue = key.startsWith(SEIDR_PREFIX);
    const idStr = isSeidrValue ? key.slice(SEIDR_PREFIX.length) : key;
    const id = parseInt(idStr, 10);

    // Find the symbol for this numeric ID
    if (Number.isNaN(id) || id < 0 || id >= symbolNamesArray.length) {
      continue;
    }

    const [, targetSymbol] = symbolNamesArray[id];

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
