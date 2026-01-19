import { getRenderContext } from "../render-context-contract";
import { createStateKey } from "./create-key";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Set application state for the given key.
 *
 * @template T - State type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @param {T} value - State value
 */
export function setState<T>(key: StateKey<T> | string, value: T): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  // Create render context state
  if (!globalStates.has(renderScopeID)) {
    globalStates.set(renderScopeID, new Map());
  }

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  globalStates.get(renderScopeID)!.set(key, value);
}
