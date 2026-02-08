import { getSSRScope } from "../../ssr/ssr-scope";
import { isClient } from "./browser";

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = (): boolean => !isClient();

/**
 * Executes a function only in the server environment (SSR).
 * If the function returns a Promise, it is automatically tracked by the
 * current SSR scope to be awaited before the final HTML is generated.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the server
 * @returns {T | false} The result of the function, or `false` if in the browser
 */
export function inServer<T>(fn: () => T): T | false {
  if (!isServer()) {
    return false;
  }

  const result = fn();

  // Automatically track async work in SSR scope so renderToString can await it
  if (result instanceof Promise) {
    getSSRScope()?.addPromise(result);
  }

  return result;
}
