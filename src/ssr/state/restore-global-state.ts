import { getAppState } from "../../render-context/render-context";
import { Seidr } from "../../seidr/seidr";
import { createStateKey } from "../../state/create-state-key";
import { GLOBAL_STATE_FEATURE_ID } from "../../state/feature";
import { isSeidr } from "../../util/type-guards/is-observable";

/**
 * Restores state values for a render context during hydration.
 *
 * @param {Record<string, unknown>} state - Record of numeric IDs to values from SSR
 */
export const restoreGlobalState = (state: Record<string, unknown>): void => {
  const appState = getAppState();
  let ctxStates = appState.getData<Map<symbol, unknown>>(GLOBAL_STATE_FEATURE_ID);

  if (!ctxStates || !(ctxStates instanceof Map)) {
    ctxStates = new Map();
    appState.setData(GLOBAL_STATE_FEATURE_ID, ctxStates);
  }

  for (const [key, value] of Object.entries(state)) {
    const targetSymbol = createStateKey(key);
    const existingValue = ctxStates.get(targetSymbol);

    if (isSeidr(existingValue)) {
      existingValue.value = value;
    } else {
      // Create an initial Seidr that useState will pick up
      ctxStates.set(targetSymbol, new Seidr(value, { id: key }));
    }
  }
};
