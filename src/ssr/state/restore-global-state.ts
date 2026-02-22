import { getRenderContext } from "../../render-context";
import { getFeature } from "../../render-context/feature";
import { Seidr } from "../../seidr/seidr";
import { createStateKey } from "../../state/create-state-key";
import { getGlobalStateFeature } from "../../state/feature";
import { isSeidr } from "../../util/type-guards/is-observable";

/**
 * Restores state values for a render context during hydration.
 *
 * @param {Record<string, unknown>} state - Record of numeric IDs to values from SSR
 */
export function restoreGlobalState(state: Record<string, unknown>): void {
  const ctx = getRenderContext();
  const ctxStates = getFeature(getGlobalStateFeature(), ctx);

  for (const [key, value] of Object.entries(state)) {
    const targetSymbol = createStateKey(key);
    const existingValue = ctxStates.get(targetSymbol);

    if (isSeidr(existingValue)) {
      existingValue.value = value;
    } else {
      ctxStates.set(targetSymbol, new Seidr(value));
    }
  }
}
