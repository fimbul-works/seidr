/**
 * Wraps a value as an Error instance if it is not already an instance of the provided constructor.
 *
 * @template E - The type of Error to wrap the value as
 * @param {any} err - The value to wrap as an Error
 * @param {new (message: string, options?: { cause?: unknown }) => E} [errorClass=Error] - The constructor to use for creating the Error (default: `Error`)
 * @returns {E} The original Error instance or a new Error instance with the provided value as the cause
 */
export const wrapError = <E extends Error = Error>(
  err: any,
  errorClass: new (message: string, options?: { cause?: unknown }) => E = Error as any,
): E =>
  err instanceof errorClass ? err : new errorClass(err instanceof Error ? err.message : String(err), { cause: err });
