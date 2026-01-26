import { getCurrentComponent } from "../dom/component-stack";
import { getRenderContext } from "../render-context-contract";
import { Seidr } from "../seidr";
import { unwrapSeidr } from "../util";
import { isSeidr } from "../util/is";
import { createStateKey } from "./create-key";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Hook for managing application state with key as a Seidr singleton.
 *
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @returns {[Seidr<T>, (v: T | Seidr<T>) => Seidr<T>]} Tuple with the Seidr observable and a setter.
 */
export function useState<T>(key: StateKey<T> | string): [Seidr<T>, (v: T | Seidr<T>) => Seidr<T>] {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  // Warn if useState is used outside of component tree
  if (!getCurrentComponent()) {
    console.warn("Calling useState outside of component hierarchy");
  }

  // Ensure ctx states map exists
  if (!globalStates.has(renderScopeID)) {
    globalStates.set(renderScopeID, new Map());
  }
  const ctxStates = globalStates.get(renderScopeID)!;

  let observable: Seidr<T>;
  const existing = ctxStates.get(key);

  if (isSeidr(existing)) {
    observable = existing as Seidr<T>;
  } else {
    // Wrap plain value (or undefined) and save it as the singleton
    observable = new Seidr<T>(existing as T);
    ctxStates.set(key, observable);
  }

  const setter = (v: T | Seidr<T>): Seidr<T> => {
    observable.value = unwrapSeidr(v);
    return observable;
  };

  return [observable, setter];
}
