import { getCurrentComponent } from "../component/component-stack";
import { getFeature } from "../render-context/feature";
import { Seidr, unwrapSeidr } from "../seidr";
import { isServer } from "../util/environment/server";
import { isEmpty, isSeidr, isStr } from "../util/type-guards";
import { createStateKey } from "./create-state-key";
import { getGlobalStateFeature } from "./feature";
import { storageConfig } from "./storage";
import { bindStorage } from "./storage-middleware";
import type { StateKey, StateOptions } from "./types";

/**
 * Hook for managing application state with key as a Seidr singleton.
 * Can optionally persist state to local/session storage.
 *
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @param {T} value - Value for the state. If null/undefined, an existing state will be used, otherwise undefined
 * @param {StateOptions<T>} [options] - Optional configuration for storage and error handling
 * @returns {[Seidr<T>, (v: T | Seidr<T>) => Seidr<T>]} Tuple with the Seidr observable and a setter.
 */
export const useState = <T>(
  key: StateKey<T> | string,
  value?: T,
  options?: StateOptions,
): [Seidr<T>, (v: T | Seidr<T>) => Seidr<T>] => {
  // Resolve key lazily to ensure we use the correct RenderContext in SSR
  const originalKey = key;
  const strKey = String(originalKey);
  if (isStr(key)) {
    key = createStateKey<T>(key);
  }

  // Warn if useState is used outside of component tree
  if (!getCurrentComponent()) {
    console.warn("Calling useState outside of component hierarchy");
  }

  // Ensure ctx states map exists
  const ctxStates = getFeature(getGlobalStateFeature());

  // Ensure state exists
  let observable = ctxStates.get(key) as Seidr<T>;
  if (!observable) {
    observable = new Seidr<T>(value as T);
    ctxStates.set(key, observable);
  } else if (!isEmpty(value)) {
    // Set initial value if given value is not null/undefined
    observable.value = value;
  }

  // Persist state to storage if specified
  if (options?.storage) {
    // Only run on client
    if (!isServer()) {
      // Check if already bound
      const [storedType] = storageConfig.get(key) || [undefined];

      if (!storedType) {
        bindStorage(key, observable, options.storage, options.onStorageError);
      } else if (process.env.NODE_ENV === "development" && storedType !== options.storage) {
        console.warn(
          `State ${strKey} is already bound to ${storedType}, ignoring request to bind to ${options.storage}`,
        );
      }
    }
  }

  /**
   * Set the value of the state
   * @param {T | Seidr<T>} v - Value to set
   * @returns {Seidr<T>} The observable
   */
  const setValue = (v: T | Seidr<T>): Seidr<T> => {
    // Derived are assigned directly
    if (isSeidr<T>(v) && v.isDerived) {
      observable = v;
      ctxStates.set(key as StateKey<T>, observable);
    } else {
      while (isSeidr<T>(v) && !v.isDerived) {
        v = unwrapSeidr(v);
      }
      observable.value = v as T;
    }
    return observable;
  };

  return [observable, setValue];
};
