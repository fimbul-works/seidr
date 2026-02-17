import { isSeidr } from "../util/type-guards";
import { Seidr } from "./seidr";
import type { SeidrOptions } from "./types";

/**
 * Convenience helper to wrap a value in a Seidr observable.
 * @template T - Type of value
 * @param {T | Seidr<T>} v - Value or Seidr with value
 * @returns {Seidr<T>} Seidr wrapped vaue
 */
export const wrapSeidr = <T>(v: T | Seidr<T>, options?: SeidrOptions): Seidr<T> =>
  isSeidr<T>(v) ? (v as Seidr<T>) : new Seidr(v as T, options);
