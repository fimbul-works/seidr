import { SEIDR_WEAVE, TYPE_PROP } from "../constants";
import { type Seidr, unwrapSeidr, wrapSeidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { isObj, isSeidr, isWeave } from "../util/type-guards";
import type { ObservableOptions, Weave } from "./types";
import { optionsForChild } from "./utils";

/**
 * Creates a reactive Weave from an object.
 *
 * @template {object} T - The type of the object to make reactive
 * @template {keyof T} K - The keys of the object to make reactive
 * @param {T} shape - The object to make reactive
 * @returns {Weave<T>} A new Weave
 */
export const weave = <T extends object = object, K extends keyof T & string = keyof T & string>(
  shape: T,
  options?: ObservableOptions,
): Weave<T, K> => {
  /**
   * Recursively builds a map of Seidr instances from an object.
   *
   * @template {object} D - The type of the object to build a map from
   * @template {Weave<D> | Seidr<D>} W - The type of the map
   * @param {T} value - The object to build a map from.
   * @param {(value: T) => D} transformFn - Function to transform the value.
   * @returns {W} A map of Seidr instances.
   */
  const wrap = <D, W = D extends object ? Weave<D> : Seidr<D>>(
    value: T,
    transformFn: (value: T) => D = (v) => v as any,
  ): W => {
    const v = transformFn(value);
    return (
      isObj(v)
        ? isWeave(v) || isSeidr(v)
          ? v // Weave and Seidr are already wrapped
          : Object.fromEntries(
              Object.entries(v).map(([key, value]) => [
                key,
                // Wrap objects in Weave and primitives in Seidr
                isObj(value) ? weave(value, optionsForChild(options)) : wrapSeidr(value, optionsForChild(options)),
              ]),
            )
        : // Wrap primitives in Seidr
          wrapSeidr(v, optionsForChild(options))
    ) as W;
  };

  /**
   * Unwraps the weave to an object.
   *
   * @template {object} T - The type of the object to unwrap
   * @template {keyof T} K - The keys of the object to unwrap
   * @param {Weave<T, K>} value - The weave to unwrap
   * @returns {T} The unwrapped object
   */
  const unwrap = (value: any): any => {
    if (isSeidr(value)) {
      return unwrapSeidr(value);
    }
    if (isWeave(value)) {
      // Use the Weave's own entries() API to get raw data without hitting Proxy traps
      return Object.fromEntries(value.entries().map(([k, v]: [any, any]) => [k, unwrap(v)]));
    }
    if (isObj(value)) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, unwrap(v)]));
    }
    return value;
  };

  /**
   * Returns the current state as a plain object.
   * @returns {T} The current state
   */
  const getUnwrapped = (): T =>
    Object.fromEntries(Array.from(data.entries()).map(([key, val]) => [key, unwrap(val)])) as T;

  /**
   * The observers map.
   */
  const observers = new Map<K, Set<(v: T) => void>>();

  /**
   * The data map.
   */
  const data = new Map<K, Seidr<T[K]> | Weave<any>>(
    Object.entries(wrap(shape)) as [K, Seidr<T[K]> | Weave<T[K] extends object ? T[K] : any>][],
  );

  /**
   * Cleanups for the current transmute.
   */
  let cleanups: CleanupFunction[] = [];

  /**
   * Keys used when trasmuting.
   */
  let transmuteKeys: K[] = [];

  /**
   * Keys used when binding.
   */
  let boundKeys: K[] = [];

  /**
   * Cleanups for child subscriptions.
   */
  const childSubscriptions = new Map<K, CleanupFunction[]>();

  /**
   * The API object.
   */
  const api = {
    [TYPE_PROP]: SEIDR_WEAVE,

    observe(changedFn, keys: K[] = Object.keys(shape) as K[]): CleanupFunction {
      // Register the observer for each key
      keys.forEach((key) =>
        observers.has(key) ? observers.get(key)?.add(changedFn) : observers.set(key, new Set([changedFn])),
      );

      // Create subscriptions for child values (Weaves/Seidrs)
      const newCleanups = keys
        .map((key) => {
          const v = data.get(key);
          // Subscribe to child changes
          const cleanup = v?.observe?.(() => changedFn(getUnwrapped()));

          if (cleanup) {
            // Track this cleanup in our childSubscriptions map
            if (!childSubscriptions.has(key)) {
              childSubscriptions.set(key, []);
            }
            childSubscriptions.get(key)?.push(cleanup);
            return cleanup;
          }
          return null;
        })
        .filter(Boolean) as CleanupFunction[];

      // This function cleans up THIS specific observation call
      return () => {
        // 1. Remove the observer function from our tracking sets
        observers.forEach((keyObservers, key) => {
          keyObservers.delete(changedFn);
          if (keyObservers.size === 0) {
            observers.delete(key);
          }
        });

        // 2. We need to remove the SPECIFIC child listeners we created for this observation.
        // The original code returned a closure that captured `cleanups` (the array of child listener cleanups).
        // Since we now ALSO store them in `childSubscriptions` for the purpose of "transferring" them on object updates,
        // we have a bit of a dual-ownership or reference problem.

        // Actually, my `set` logic iterates `observers.get(key)` (which are the root callbacks)
        // and RE-CREATES child subscriptions for them.

        // Use the captured `newCleanups` to kill the listeners initiated by THIS call.
        newCleanups.forEach((cleanup) => cleanup());

        // AND validation: we should remove these specific cleanups from `childSubscriptions` so they don't get double-called or leak?
        // If we destroy the observer, we don't want `set` to try to re-subscribe it later?
        // Wait, `set` uses `observers.get(key)`. If we removed `changedFn` from `observers.get(key)` (Step 1 above),
        // then `set` WON'T see it and WON'T try to re-subscribe it.
        // So we just need to ensure the *current* child listeners are killed.

        // BUT, `childSubscriptions` still holds these cleanups.
        // If we don't remove them from `childSubscriptions`, then when `set` happens:
        // `set` calls `childSubscriptions.get(key).forEach(cleanup => cleanup())` -> DEAD listeners are killed again? (Might be harmless if idempotent)
        // AND then `set` logic does NOT create new listeners because `changedFn` is gone from `observers`.

        // Ideally we should remove them from `childSubscriptions` to keep memory clean.
        keys.forEach((key) => {
          const subs = childSubscriptions.get(key);
          if (subs) {
            // Remove the specific cleanups we just called/are about to call
            // This is O(N*M) but N (cleanups per key) is usually small (1 per observer).
            const remaining = subs.filter((c) => !newCleanups.includes(c));
            if (remaining.length === 0) {
              childSubscriptions.delete(key);
            } else {
              childSubscriptions.set(key, remaining);
            }
          }
        });
      };
    },
    bind(target, bindFn, keys = []): CleanupFunction {
      boundKeys = keys;
      bindFn(proxy as any, target);
      return api.observe(() => bindFn(proxy as any, target), boundKeys);
    },
    as<D>(transformFn: (value: T) => D) {
      transmuteKeys = [];
      const result = wrap(shape, transformFn);
      cleanups.push(api.observe(() => transformFn(unwrap(Object.fromEntries(data.entries()) as any)), transmuteKeys));
      transmuteKeys = [];
      return result;
    },
    observerCount() {
      return cleanups.length;
    },
    destroy() {
      cleanups.forEach((cleanup) => cleanup?.());
      cleanups = [];
    },
    keys(): K[] {
      return Array.from(data.keys());
    },
    values(): (Seidr<T[K]> | Weave<any>)[] {
      return Array.from(data.values());
    },
    entries(): [K, Seidr<T[K]> | Weave<any>][] {
      return Array.from(data.entries());
    },
    toJSON() {
      return getUnwrapped();
    },
    /**
     * Custom inspection for Node.js (console.log)
     */
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return {
        ...Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, isSeidr(v) ? v.value : v])),
        ...Object.fromEntries(Object.entries(api).filter(([k]) => typeof api[k as keyof typeof api] === "function")),
      };
    },
  } as Weave<T, K>;

  // Define API methods as non-enumerable to prevent cluttering console.log and Object.keys
  Object.defineProperties(api, {
    observe: { enumerable: false },
    bind: { enumerable: false },
    as: { enumerable: false },
    observerCount: { enumerable: false },
    destroy: { enumerable: false },
    keys: { enumerable: false },
    values: { enumerable: false },
    entries: { enumerable: false },
    toJSON: { enumerable: false },
    [Symbol.for("nodejs.util.inspect.custom")]: { enumerable: false },
  });

  /**
   * The proxy object.
   */
  const proxy = new Proxy(api, {
    get(target, prop) {
      if (prop === TYPE_PROP) {
        return SEIDR_WEAVE;
      }
      if (prop in target) {
        return Reflect.get(target, prop);
      }
      if (!boundKeys.includes(prop as K)) {
        boundKeys.push(prop as K);
      }
      if (!transmuteKeys.includes(prop as K)) {
        transmuteKeys.push(prop as K);
      }
      const v = data.get(prop as K);
      if (!v) {
        return undefined;
      }
      return isSeidr(v) ? v.value : v;
    },
    set(target, prop, value) {
      if (prop === TYPE_PROP) {
        return false;
      }
      if (prop in target) {
        return Reflect.set(target, prop, value);
      }

      const v = data.get(prop as K);

      // If the property doesn't exist in data, we might be adding a new property
      // ignoring that for now as per current implementation scope, or just returning false like before could be fine
      // but let's stick to existing behavior if v is missing
      if (!v) {
        // If we want to support adding new properties later, we'd need to handle it here.
        // For now, consistent with previous behavior:
        return false;
      }

      if (isSeidr(v)) {
        v.value = value;
      } else {
        // It's a Weave or similar object structure we are replacing.
        // 1. Remove old child subscriptions for this key
        const key = prop as K;
        if (childSubscriptions.has(key)) {
          childSubscriptions.get(key)?.forEach((cleanup) => cleanup());
          childSubscriptions.delete(key);
        }

        // 2. Wrap and set new value
        const newWrapped = isObj(value) ? weave(value) : wrapSeidr(value, optionsForChild(options));
        data.set(key, newWrapped as Seidr<T[K]> | Weave<any, string>);

        // 3. Re-subscribe active observers to the new value
        if (observers.has(key)) {
          const keyObservers = observers.get(key);
          if (keyObservers) {
            const newCleanups: CleanupFunction[] = [];
            keyObservers.forEach((observer) => {
              // Check if the new value has an observe method (it should if it's Weave or Seidr)
              // If it's a Weave, we might need a recursive observation or just observe the root if that's how it works.
              // The original code did: data.get(key)?.observe?.(() => changedFn(getUnwrapped()))
              // So we do the same.
              const cleanup = (newWrapped as any).observe?.(() => observer(getUnwrapped()));
              if (cleanup) newCleanups.push(cleanup);
            });
            childSubscriptions.set(key, newCleanups);
          }
        }

        // 4. Notify observers of this key that the value changed (the object identity changed)
        // actually, the observers above are for *deep* changes usually?
        // In the original:
        // observers.get(key)?.add(changedFn) -> these are triggered when child changes?
        // Wait, `observe` implementation:
        // keys.map(key => ... data.get(key)?.observe?.(() => changedFn(getUnwrapped())))
        // So `observers` map stores the root callback `changedFn`.
        // And we attach a listener to the child that calls `changedFn`.

        // When we replace the child object:
        // The old child's listener is dead (we didn't keep track of it well before, but now we will).
        // We just attached new listeners in step 3.
        // We should ALSO trigger the observer immediately because the value *just* changed?
        // Usually `observe` is for *changes*, setting the value IS a change.
        // But `Seidr.value = ...` triggers observers.
        // Here we just swapped the backend storage.
        // If we treat this as a change, we should call the observers.
        observers.get(key)?.forEach((fn) => fn(getUnwrapped()));
      }
      return true;
    },
    has(target, prop) {
      if (prop === TYPE_PROP) {
        return true;
      }
      if (prop in target) {
        return true;
      }
      return data.has(prop as K);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).concat(Array.from(data.keys()));
    },
    getOwnPropertyDescriptor(target, prop) {
      if (data.has(prop as K)) {
        return {
          enumerable: true,
          configurable: true,
          value: proxy[prop as K],
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }) as Weave<T, K>;

  return proxy;
};
