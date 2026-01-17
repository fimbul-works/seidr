import { getRenderContext } from "../render-context-contract";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Set application state for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T>} key - Key for the state
 * @param {T} value - State value
 */
export function setState<T>(key: StateKey<T>, value: T): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  // Create render context state
  if (!globalStates.has(renderScopeID)) {
    globalStates.set(renderScopeID, new Map());
  }
  globalStates.get(renderScopeID)!.set(key, value);
}
