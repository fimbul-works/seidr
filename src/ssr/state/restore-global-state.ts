import { getRenderContext } from "../../render-context";
import { Seidr } from "../../seidr/seidr";
import { createStateKey } from "../../state/create-state-key";
import { globalStates } from "../../state/storage";
import { isSeidr } from "../../util/type-guards/is-seidr";

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
  let ctxStates = globalStates.get(ctxID);
  if (!ctxStates) {
    ctxStates = new Map();
    globalStates.set(ctxID, ctxStates);
  }

  // Iterate through the captured state
  for (const [key, value] of Object.entries(state)) {
    // Resolve or create symbol for this name
    const targetSymbol = createStateKey(key);

    // Check if there's already a state value for this symbol
    const existingValue = ctxStates.get(targetSymbol);

    // Handle Seidr observable
    if (isSeidr(existingValue)) {
      // Update existing Seidr instance
      existingValue.value = value;
    } else {
      // Create new Seidr instance
      ctxStates.set(targetSymbol, new Seidr(value));
    }
  }
}
