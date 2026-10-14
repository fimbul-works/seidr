import { isValue } from "./type-guards.js";
import type { Value, ValueOptions } from "./types.js";
import { createValue } from "./value.js";

/**
 * Convenience helper to wrap an observable Value.
 *
 * @template T - Type of value
 * @param {T | Value<T>} v - Value or observable Value
 * @param {ValueOptions} [options] - Options for the new Value
 * @returns {Value<T>} Wrapped observable Value
 */
export const wrapValue = <T>(v: T | Value<T>, options?: ValueOptions): Value<T> =>
  isValue<T>(v) ? v : createValue(v, options);
