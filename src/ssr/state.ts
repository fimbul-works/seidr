import { Seidr } from "../core/seidr.js";
import { renderContextStates, symbolNames } from "../core/state.js";
import { isSeidr } from "../core/util/is.js";

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 *
 * @param {number} renderContextID - Render context ID
 * @returns {boolean} true if the renderScopeState existed, false otherwise
 */
export const clearRenderContextState = (renderContextID: number) => renderContextStates.delete(renderContextID);

/**
 * Captures all State values for a render context during SSR.
 *
 * This function iterates through all State values stored for the given render context,
 * and captures only the non-derived Seidr instances. The result is a record mapping
 * string keys (from the symbol names) to the Seidr values.
 *
 * @param {number} renderContextID - Render context ID
 * @returns {Record<string, unknown>} Object mapping string keys to non-derived Seidr values
 *
 * @example
 * ```typescript
 * // During SSR
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 * setState(USER_KEY, new Seidr("Alice"));
 *
 * const state = captureRenderContextState(ctx.renderContextID);
 * // Returns: { "user": "Alice" }
 * ```
 */
export function captureRenderContextState(renderContextID: number): Record<string, unknown> {
  const ctxStates = renderContextStates.get(renderContextID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, unknown> = {};

  // Build a reverse lookup map
  const reverseSymbolNames = new Map<symbol, string>();
  symbolNames.entries().forEach(([key, symbol]) => reverseSymbolNames.set(symbol, key));

  // Iterate through all State values
  for (const [symbol, value] of ctxStates.entries()) {
    const key = reverseSymbolNames.get(symbol);

    // Only include non-derived Seidr instances
    if (key && isSeidr(value) && !value.isDerived) {
      captured[key] = value.value;
    }
  }

  return captured;
}

/**
 * Restores State values for a render context during hydration.
 *
 * This function takes the captured state from SSR and restores it to the
 * render context's State storage. It uses the symbol name registry to
 * map string keys back to their original symbols.
 *
 * @param {number} renderContextID - Render context ID
 * @param {Record<string, unknown>} state - Record of string keys to values from SSR
 *
 * @example
 * ```typescript
 * // During hydration
 * const USER_KEY = createStateKey<Seidr<string>>("user");
 *
 * restoreRenderContextState(ctx.renderContextID, { "user": "Alice" });
 *
 * const user = getState<Seidr<string>>(USER_KEY);
 * // user.value is now "Alice"
 * ```
 */
export function restoreRenderContextState(renderContextID: number, state: Record<string, unknown>): void {
  // Ensure the render context has a State storage
  if (!renderContextStates.has(renderContextID)) {
    renderContextStates.set(renderContextID, new Map());
  }

  const ctxStates = renderContextStates.get(renderContextID)!;

  // Iterate through the captured state
  for (const [name, value] of Object.entries(state)) {
    // Find the symbol for this name
    let targetSymbol: symbol | undefined;

    for (const [key, symbol] of symbolNames.entries()) {
      if (key === name) {
        targetSymbol = symbol;
        break;
      }
    }

    // Skip values without registered symbols
    if (!targetSymbol) {
      continue;
    }

    // Check if there's already a State value for this symbol
    const existingValue = ctxStates.get(targetSymbol);

    // If it's a Seidr instance, update its value
    if (isSeidr(existingValue)) {
      existingValue.value = value;
    } else {
      // Initialize new Seidr
      ctxStates.set(targetSymbol, new Seidr(value));
    }
  }
}
