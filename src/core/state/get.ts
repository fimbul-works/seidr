import { getRenderContext } from "../render-context-contract";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Get application state with key.
 *
 * @template T - state type
 *
 * @param {StateKey<T>} key - Key for the state
 * @returns {T} State value
 * @throws {Error} if state is not set
 */
export function getState<T>(key: StateKey<T>): T {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  const ctxStates = globalStates.get(renderScopeID);
  if (!ctxStates?.has(key)) {
    throw new Error(`State not found for key: ${String(key)}`);
  }

  return ctxStates.get(key) as T;
}
