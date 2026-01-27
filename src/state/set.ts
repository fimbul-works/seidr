import type { Seidr } from "../../state/seidr";
import { unwrapSeidr } from "../../util";
import { isSeidr } from "../../util/type-guards/is";
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
 * @param {T | Seidr<T>} value - State value or Seidr observable
 */
export function setState<T>(key: StateKey<T> | string, value: T | Seidr<T>): void {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.ctxID : 0;
  // Create render context state
  if (!globalStates.has(renderScopeID)) {
    globalStates.set(renderScopeID, new Map());
  }

  const ctxStates = globalStates.get(renderScopeID)!;

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  const existing = ctxStates.get(key);
  if (isSeidr(existing)) {
    // Update existing Seidr instead of replacing it
    (existing as Seidr<T>).value = unwrapSeidr(value);
  } else {
    ctxStates.set(key, value);
  }
}
