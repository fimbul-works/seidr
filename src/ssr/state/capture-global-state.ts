import { getRenderContext } from "../../render-context";
import { getFeature } from "../../render-context/feature";
import { getGlobalStateFeature } from "../../state/feature";

/**
 * Captures all state values for a render context during SSR.
 * This function handles serializing the global state feature mapping.
 *
 * @param {number} _ctxID - Render context ID (now ignored in favor of `getRenderContext()`)
 * @returns {Record<string, any>} Object mapping state keys to values
 */
export function captureGlobalState(_ctxID?: number): Record<string, any> {
  const globalStateFeature = getGlobalStateFeature();
  const stateMap = getFeature(globalStateFeature, getRenderContext());
  return globalStateFeature.serialize!(stateMap);
}
