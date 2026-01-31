/**
 * Wraps a value as an Error instance if it is not already an instance of the provided constructor.
 *
 * @param {unknown} err - The value to wrap as an Error
 * @param {new (message: string, options?: { cause?: unknown }) => E} [Constructor=Error] - The constructor to use for creating the Error
 * @returns {E} The original Error instance or a new Error instance with the provided value as the cause
 */
export function wrapError<E extends Error = Error>(
  err: unknown,
  Constructor: new (message: string, options?: { cause?: unknown }) => E = Error as any,
): E {
  if (err instanceof Constructor) {
    return err;
  }

  const message = err instanceof Error ? err.message : String(err);
  return new Constructor(message, { cause: err });
}
