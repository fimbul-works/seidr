import { getRenderContext } from "../render-context-contract";
import { createStateKey } from "./create-key";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Check if application state exists for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @returns {boolean} true if a state with this key exists, false otherwise
 */
export function hasState<T>(key: StateKey<T> | string): boolean {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.ctxID : 0;

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  return globalStates.get(renderScopeID)?.has(key) ?? false;
}
