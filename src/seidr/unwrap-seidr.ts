import { isSeidr } from "../util/type-guards";
import type { Seidr } from "./seidr";

/**
 * Convenience helper to extract the value from an observable, or base value.
 * @template T - Type of value
 * @param {T} v - Value or Seidr with value
 * @returns {T} Extracted value
 */
export const unwrapSeidr = <T>(v: T | Seidr<T>): T => (isSeidr<T>(v) ? v.value : v);
