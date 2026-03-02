import { str } from "./string";

/**
 * Wraps a value as an Error instance if it is not already an instance of the provided constructor.
 *
 * @param {any} err - The value to wrap as an Error
 * @param {new (message: string, options?: { cause?: unknown }) => E} [Constructor=Error] - The constructor to use for creating the Error
 * @returns {E} The original Error instance or a new Error instance with the provided value as the cause
 */
export const wrapError = <E extends Error = Error>(
  err: any,
  Constructor: new (message: string, options?: { cause?: unknown }) => E = Error as any,
): E =>
  err instanceof Constructor ? err : new Constructor(err instanceof Error ? err.message : str(err), { cause: err });
