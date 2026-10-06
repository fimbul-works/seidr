import { isValue } from "./type-guards.js";
import type { Value } from "./value.js";

/**
 * Extracts the inner type from a Value, or leaves the type as-is if not a Value.
 */
export type Unwrapped<T> = T extends Value<infer U> ? U : T;

/**
 * Convenience helper to extract the value from an observable, or base value.
 *
 * @template T - Type of value
 * @param {T | Value<T>} v - Value or observable Value
 * @returns {T} Extracted value
 */
export function unwrapValue<T>(v: T | Value<T>): T;
export function unwrapValue<T>(v: T): Unwrapped<T>;
export function unwrapValue(v: any): any {
  return isValue(v) ? v() : v;
}
