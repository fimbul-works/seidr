import { SEIDR_WEAVE, TYPE_PROP } from "../constants";
import { type Seidr, unwrapSeidr, wrapSeidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { isObj, isSeidr, isWeave } from "../util";
import type { ObservableObject } from "./types";

/**
 * A weave is a reactive object that wraps Seidr instances.
 */
export type Weave<T extends object = object, K extends keyof T & string = keyof T & string> = ObservableObject<T, K> & {
  /**
   * The type of the object.
   */
  [TYPE_PROP]: typeof SEIDR_WEAVE;
} & { [key in K]: T[K] extends object ? Weave<T[K]> : T[K] };

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
                isObj(value) ? weave(value) : wrapSeidr(value),
              ]),
            )
        : // Wrap primitives in Seidr
          wrapSeidr(v)
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
  const unwrap = <T extends object = object, K extends keyof T & string = keyof T & string>(value: Weave<T, K>): T =>
    Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        isSeidr(value) ? unwrapSeidr(value) : unwrap<T, K>(value as any),
      ]),
    ) as T;

  /**
   * Returns the current entries of the weave.
   * @returns {T} The current entries of the weave
   */
  const entries = (): T => unwrap(Object.fromEntries(data.entries()) as any) as T;

  /**
   * The observers map.
   */
  const observers = new Map<K, Set<(v: T) => void>>();

  /**
   * The data map.
   */
  const data = new Map<K, Seidr<T[K]> | Weave<any>>(Object.entries(wrap(shape)) as [K, Seidr<T[K]> | Weave<any>][]);

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
   * The API object.
   */
  const api: ObservableObject<T, K> = {
    observe(changedFn, keys: K[] = Object.keys(shape) as K[]): CleanupFunction {
      keys.forEach((key) =>
        observers.has(key) ? observers.get(key)?.add(changedFn) : observers.set(key, new Set([changedFn])),
      );
      const cleanups = keys
        .map(
          (key) => (
            !observers.has(key) ? observers.set(key, new Set([changedFn])) : observers.get(key)?.add(changedFn),
            data.has(key) ? data.get(key)?.observe?.(() => changedFn(entries())) : null
          ),
        )
        .filter(Boolean);
      return () => {
        cleanups.forEach((cleanup) => cleanup?.());
        cleanups.length = 0;
        observers.forEach(
          (keyObservers, key) => (
            keyObservers.delete(changedFn), keyObservers.size === 0 ? observers.delete(key) : null
          ),
        );
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
      return result as any;
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
  };

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
      if (!v) {
        return false;
      }
      if (isSeidr(v)) {
        v.value = value;
      } else {
        Reflect.set(v, prop, wrap(value));
        if (isWeave(v)) {
          observers.get(prop as K)?.values().map(v => data.get(prop as K)?.observe(v))
        }
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
  }) as Weave<T, K>;

  return proxy;
};
