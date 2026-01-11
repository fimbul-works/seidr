import { Seidr } from "../seidr";
import { isSeidr } from "./is";

/**
 * Convenience helper to wrap a value in a Seidr observable.
 * @template T - Type of value
 * @param {T | Seidr<T>} v - Value or Seidr with value
 * @returns {Seidr<T>} Seidr wrapped vaue
 */
export const wrapSeidr = <T>(v: T | Seidr<T>): Seidr<T> => (isSeidr(v) ? v : new Seidr(v as T));
