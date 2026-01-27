/**
 * Check if a value is an Error.
 *
 * @param {any} v - Value to check
 * @param {new (message?: string | undefined) => Error} errorConstructor - Optional Error class constructor (default: `Error`)
 * @returns {boolean} `true` if the value is an instance of `errorClass`, `false` otherwise
 */
export const isError = (
  v: any,
  errorConstructor: new (message?: string | undefined) => Error = Error,
): v is InstanceType<typeof errorConstructor> => v instanceof errorConstructor;
