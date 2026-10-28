import { isValue } from "./type-guards.js";
import type { ObservableValue, ValueOptions } from "./types.js";
import { createValue } from "./value.js";

/**
 * Convenience helper to wrap an observable Value.
 *
 * @template T - Type of value
 * @param {T | ObservableValue<T>} v - Value or observable Value
 * @param {ValueOptions} [options] - Options for the new Value
 * @returns {ObservableValue<T>} Wrapped observable Value
 */
export function wrapValue<T>(v: T | ObservableValue<T>, options?: ValueOptions): ObservableValue<T>;
export function wrapValue<T>(v: any, options?: ValueOptions): ObservableValue<T> {
  return isValue<T>(v) ? (v as ObservableValue<T>) : createValue(v as T, options);
}
