import { getRenderContext } from "../render-context-contract";
import { createStateKey } from "./create-key";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Get application state with key.
 *
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @returns {T | undefined} State value, or `undefined` if not set
 */
export function getState<T>(key: StateKey<T> | string): T | undefined {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.ctxID : 0;

  const ctxStates = globalStates.get(renderScopeID);

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  // No state found for key
  if (!ctxStates?.has(key)) {
    return undefined;
  }

  return ctxStates.get(key) as T;
}
