import { unwrapSeidr } from "../../seidr";
import { globalStates, symbolNames } from "../../state/storage";

/**
 * Captures all state values for a render context during SSR.
 * This function iterates through all state values stored for the given render context.
 *
 * @param {number} ctxID - Render context ID
 * @returns {Record<string, any>} Object mapping state keys to values
 */
export function captureGlobalState(ctxID: number): Record<string, any> {
  const ctxStates = globalStates.get(ctxID);
  if (!ctxStates) {
    return {};
  }

  const captured: Record<string, any> = {};

  const symbolToName = new Map<symbol, string>();
  for (const [name, sym] of symbolNames.entries()) {
    symbolToName.set(sym, name);
  }

  for (const [symbol, value] of ctxStates.entries()) {
    if (value.isDerived) continue;

    const key = symbolToName.get(symbol);
    if (!key) continue;

    captured[key] = unwrapSeidr(value);
  }

  return captured;
}
