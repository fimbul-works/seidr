import { getRenderContext } from "../render-context-contract";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Check if application state exists for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the state
 * @returns {boolean} true if a state with this key exists, false otherwise
 */
export function hasState<T>(key: StateKey<T>): boolean {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  return globalStates.get(renderScopeID)?.has(key) ?? false;
}
