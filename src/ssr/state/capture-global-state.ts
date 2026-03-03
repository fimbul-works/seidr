import { getAppState } from "../../render-context/render-context";
import { GLOBAL_STATE_FEATURE_ID } from "../../state/feature";
import { symbolNames } from "../../state/storage";
import { isSeidr } from "../../util/type-guards";

/**
 * Captures all state values for the application state during SSR.
 *
 * @param {number} [_ctxID] - Optional context ID (for compatibility)
 * @returns {Record<string, any>} Object mapping state keys to values
 */
export function captureGlobalState(_ctxID?: number): Record<string, any> {
  const state = getAppState();
  if (!state) return {};

  const dataMap = state.getData<Map<any, any>>(GLOBAL_STATE_FEATURE_ID);
  if (!dataMap) return {};

  const result: Record<string, any> = {};

  // Build reverse map for symbols
  const symbolToName = new Map<symbol, string>();
  for (const [name, sym] of symbolNames.entries()) {
    symbolToName.set(sym, name);
  }

  for (const [key, value] of dataMap.entries()) {
    const name = typeof key === "symbol" ? symbolToName.get(key) : String(key);
    if (!name) continue;

    if (isSeidr(value)) {
      if (!value.isDerived) {
        result[name] = value.value;
      }
    } else {
      result[name] = value;
    }
  }

  return result;
}
