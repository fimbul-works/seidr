import { wrapError } from "./wrap-error";

/**
 * Executes a function safely, catching any errors and passing them to an error handler.
 *
 * @template T - The return type of the function.
 * @param {() => T} fn The function to execute.
 * @param {(error: Error) => T} onErrorFn The function to call with any errors that occur. Defaults to console.error.
 * @param {() => void} finallyFn The function to call when the function finally returns.
 */
export const safe = <T>(
  fn: () => T,
  onErrorFn: (error: Error) => T | void = console.error,
  finallyFn?: (() => void) | null,
): T => {
  try {
    return fn();
  } catch (error) {
    return onErrorFn(wrapError(error)) as T;
  } finally {
    finallyFn?.();
  }
};
