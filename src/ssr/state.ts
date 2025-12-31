import { getRenderContext } from "../core/render-context-contract";
import { Seidr } from "../core/seidr";
import { globalStates, symbolNames } from "../core/state";
import { isSeidr } from "../core/util/is";

const SEIDR_PREFIX = "$/";

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 *
 * @param {number} renderContextID - Render context ID
 * @returns {boolean} true if the renderScopeState existed, false otherwise
 */
export const clearRenderContextState = (renderContextID: number) => globalStates.delete(renderContextID);

/**
 * Captures all state values for a render context during SSR.
 *
 * This function iterates through all state values stored for the given render context,
 * and captures both Seidr observables and plain values. Seidr observable keys are
 * prefixed with "@" to distinguish them from plain values during hydration.
 *
 * @param {number} renderContextID - Render context ID
 * @returns {Record<string, unknown>} Object mapping string keys to values (Seidr keys prefixed with "$/")
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
 * // Returns: { "$/user": "Alice", "settings": { theme: "dark" } }
 * ```
 */
export function captureRenderContextState(renderContextID: number): Record<string, unknown> {
  const ctxStates = globalStates.get(renderContextID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, unknown> = {};

  // Build a reverse lookup map
  const reverseSymbolNames = new Map<symbol, string>();
  symbolNames.entries().forEach(([key, symbol]) => reverseSymbolNames.set(symbol, key));

  // Iterate through all state values
  for (const [symbol, value] of ctxStates.entries()) {
    const key = reverseSymbolNames.get(symbol);

    if (key) {
      // Skip derived Seidr instances
      if (isSeidr(value) && value.isDerived) continue;

      // Prefix Seidr observable keys with "$/"
      const stateKey = isSeidr(value) ? `${SEIDR_PREFIX}${key}` : key;
      captured[stateKey] = isSeidr(value) ? value.value : value;
    }
  }

  return captured;
}

/**
 * Restores state values for a render context during hydration.
 *
 * This function takes the captured state from SSR and restores it to the
 * render context's state storage. Keys prefixed with "$/" are automatically
 * wrapped in Seidr observables, while other keys are stored as plain values.
 *
 * @param {Record<string, unknown>} state - Record of string keys to values from SSR
 *
 * @example
 * ```typescript
 * // During hydration
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 * const SETTINGS_KEY = createStateKey<{ theme: string }>("settings");
 *
 * restoreGlobalState({
 *   "$/user": "Alice",
 *   "settings": { theme: "dark" }
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

  // Iterate through the captured state
  for (const [name, value] of Object.entries(state)) {
    // Check if key is prefixed with "$/" (Seidr observable)
    const isSeidrValue = name.startsWith(SEIDR_PREFIX);
    const actualName = isSeidrValue ? name.slice(SEIDR_PREFIX.length) : name;

    // Find the symbol for this name
    let targetSymbol: symbol | undefined;

    for (const [key, symbol] of symbolNames.entries()) {
      if (key === actualName) {
        targetSymbol = symbol;
        break;
      }
    }

    // Skip values without registered symbols
    if (!targetSymbol) {
      continue;
    }

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
