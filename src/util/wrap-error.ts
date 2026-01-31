/**
 * Wraps a value as an Error instance if it is not already an Error.
 *
 * @param {any} err - The value to wrap as an Error
 * @param {(new (message: string) => Error)} [errorConstructor=Error] - The constructor to use for creating the Error (default: `Error`)
 * @returns {InstanceType<typeof errorConstructor>} The original Error instance or a new Error instance with the provided value
 */
export const wrapError = (err: unknown, errorConstructor: new (message: string) => Error = Error): Error =>
  err instanceof Error ? err : new errorConstructor(String(err));
