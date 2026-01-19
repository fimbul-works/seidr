import { getComponentStack, getCurrentComponent } from "../dom";
import { getRenderContext } from "../render-context-contract";
import { Seidr } from "../seidr";
import { unwrapSeidr, wrapSeidr } from "../util";
import { createStateKey } from "./create-key";
import { setState } from "./set";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Get application state with key.
 *
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @returns {[Seidr<T> | undefined, (v: T) => Seidr<T>]} Tuple with the first element either `Seidr<T>` or `undefiend`,
 *                                                       and the second element a setter that returns `Seidr<T>`.
 */
export function useState<T>(key: StateKey<T> | string): [Seidr<T>, (v: StateKey<T> | T) => Seidr<T>] {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;
  const ctxStates = globalStates.get(renderScopeID);

  // Warn if useState is used outside of component tree
  if (!getCurrentComponent()) {
    console.trace("Calling useState outside of component hierarchy", renderScopeID, getComponentStack());
  }

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (typeof key === "string") {
    key = createStateKey<T>(key);
  }

  // Value setter
  let observable: Seidr<T>;

  const valueSetter = (v: StateKey<T> | T): Seidr<T> => {
    observable.value = unwrapSeidr<T>(v as T);
    setState(key, observable.value);
    return wrapSeidr(observable);
  };

  // No state found for key
  if (!ctxStates?.has(key)) {
    observable = new Seidr<T>(undefined as any);
    setState(key, observable.value);
    return [observable, valueSetter];
  }

  // Always return an observable value
  observable = wrapSeidr<T>(ctxStates.get(key) as T);
  setState(key, observable.value);
  return [observable, valueSetter];
}
