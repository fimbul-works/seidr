import { isValue } from "./type-guards.js";
import type { ObservableValue } from "./types.js";

/**
 * Extracts the inner type from an ObservableValue, or leaves the type as-is if not an observable.
 */
export type Unwrapped<T> = T extends ObservableValue<infer U> ? U : T;

/**
 * Convenience helper to extract the value from an observable, or base value.
 *
 * @template T - Type of value
 * @param {T} v - Value or observable Value
 * @returns {Unwrapped<T>} Extracted value
 */
export function unwrapValue<T>(v: T): Unwrapped<T>;
export function unwrapValue(v: any): any {
  return isValue(v) ? v() : v;
}
