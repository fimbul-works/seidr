import { wrapError } from "./wrap-error";

/**
 * Executes a function safely, catching any errors and passing them to an error handler.
 *
 * @template T - The return type of the function.
 * @param {() => T} fn The function to execute.
 * @param {() => void} finallyFn The function to call when the function finally returns.
 * @param {(error: Error) => T} onErrorFn The function to call with any errors that occur. Defaults to console.error.
 */
export const tryCatchFinally = <T>(
  fn: () => T,
  finallyFn?: (() => void) | null,
  onErrorFn: (error: Error) => T | void = console.error,
): T => {
  try {
    return fn();
  } catch (error) {
    return onErrorFn(wrapError(error)) as T;
  } finally {
    finallyFn?.();
  }
};
