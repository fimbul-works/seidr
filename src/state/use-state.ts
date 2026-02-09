import { getCurrentComponent } from "../component/component-stack";
import { getRenderContext } from "../render-context";
import { Seidr, unwrapSeidr } from "../seidr";
import { isEmpty, isSeidr, isStr } from "../util/type-guards";
import { createStateKey } from "./create-state-key";
import { globalStates } from "./storage";
import type { StateKey } from "./types";

/**
 * Hook for managing application state with key as a Seidr singleton.
 *
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @param {T} value - Value for the state. If null/undefined, an existing state will be used, otherwise undefined
 * @returns {[Seidr<T>, (v: T | Seidr<T>) => Seidr<T>]} Tuple with the Seidr observable and a setter.
 */
export function useState<T>(key: StateKey<T> | string, value?: T): [Seidr<T>, (v: T | Seidr<T>) => Seidr<T>] {
  const { ctxID: renderContextID } = getRenderContext();

  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  if (isStr(key)) {
    key = createStateKey<T>(key);
  }

  // Warn if useState is used outside of component tree
  if (!getCurrentComponent()) {
    console.warn("Calling useState outside of component hierarchy");
  }

  // Ensure ctx states map exists
  if (!globalStates.has(renderContextID)) {
    globalStates.set(renderContextID, new Map());
  }
  const ctxStates = globalStates.get(renderContextID)!;

  // Ensure state exists
  let observable = ctxStates.get(key) as Seidr<T>;
  if (!observable) {
    observable = new Seidr<T>(value as T);
    ctxStates.set(key, observable);
  } else if (!isEmpty(value)) {
    // Set initial value if given value is not null/undefined
    observable.value = value;
  }

  const setValue = (v: T | Seidr<T>): Seidr<T> => {
    // Derived are assigned directly
    if (isSeidr(v) && v.isDerived) {
      observable = v;
      ctxStates.set(key, observable);
    } else {
      while (isSeidr(v) && !v.isDerived) {
        v = unwrapSeidr(v);
      }
      observable.value = v as T;
    }
    return observable;
  };

  return [observable, setValue];
}
