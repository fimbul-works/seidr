import { TYPE_PROP } from "../constants.js";
import { type Ref, TYPE_REF } from "../hooks/use-ref.js";
import { isFn } from "../util/type-guards.js";
import { TYPE_VALUE, type Value } from "./value.js";

/**
 * Check if a value is an observable value get-setter.
 *
 * @template T - The type of the value
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an observable value, `false` otherwise
 */
export const isValue = <T = any>(v: any): v is Value<T> =>
  isFn<Value>(v) && TYPE_PROP in v && v[TYPE_PROP] === TYPE_VALUE;

/**
 * Check if a value is a Ref.
 *
 * @template T - The type of the element
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Ref, `false` otherwise
 */
export const isRef = <T = any>(v: any): v is Ref<T> => isFn<Ref>(v) && TYPE_PROP in v && v[TYPE_PROP] === TYPE_REF;
