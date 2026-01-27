import { isError } from "./is-error";

/**
 * Convenience helper to wrap a value into an Error class.
 *
 * @param {any} v - Value to wrap into an Error
 * @param {new (message?: string | undefined) => Error} errorConstructor - Optional Error class constructor (default: `Error`)
 * @returns {InstanceType<typeof errorConstructor>} Wrapped Error value
 */
export const wrapError = (
  v: any,
  errorConstructor: new (message?: string | undefined) => Error = Error,
): InstanceType<typeof errorConstructor> => (isError(v) ? v : new errorConstructor(String(v)));
