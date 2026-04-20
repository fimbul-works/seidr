import { isSeidr } from "../util/type-guards/observable-types.js";
import { Seidr } from "./seidr.js";
import type { ObservableOptions } from "./types.js";

/**
 * Convenience helper to wrap a value in a Seidr observable.
 * @template T - Type of value
 * @param {T | Seidr<T>} v - Value or Seidr with value
 * @param {ObservableOptions} [options] - Options for the new Seidr instance
 * @returns {Seidr<T>} Seidr wrapped value
 */
export const wrapSeidr = <T>(v: T | Seidr<T>, options?: ObservableOptions): Seidr<T> =>
  isSeidr<T>(v) ? v : new Seidr(v, options);
