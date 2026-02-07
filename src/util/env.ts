import { getActiveSSRScope } from "../ssr/ssr-scope";

/**
 * Checks if the current environment is development mode.
 *
 * @returns {boolean} True if in development mode
 */
export const isDev = (): boolean => process.env.NODE_ENV === "development";

/**
 * Returns true if the current environment is the browser.
 */
export const isBrowser = (): boolean => !isServer();

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 * Accounts for Seidr's SSR test mode.
 */
export const isServer = (): boolean =>
  typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);


/**
 * Executes a function only in the browser environment.
 * Useful for client-side only side effects like DOM APIs or third-party libraries.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the client
 * @returns {T} The result of the function, or undefined if on the server
 */
export function inBrowser<T>(fn: () => T): T {
  if (typeof window !== "undefined" && (typeof process === "undefined" || !process.env.SEIDR_TEST_SSR)) {
    return fn();
  }
  return undefined as T;
}

/**
 * Executes a function only in the server environment (SSR).
 * If the function returns a Promise, it is automatically tracked by the
 * current SSR scope to be awaited before the final HTML is generated.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the server
 * @returns {T} The result of the function, or undefined if in the browser
 */
export function inServer<T>(fn: () => T): T {
  if (typeof window === "undefined" || (typeof process !== "undefined" && process.env.SEIDR_TEST_SSR)) {
    const result = fn();

    // Automatically track async work in SSR scope so renderToString can await it
    if (result instanceof Promise) {
      const scope = getActiveSSRScope();
      if (scope) {
        scope.addPromise(result);
      }
    }

    return result;
  }

  return undefined as T;
}
