import { getSSRScope } from "../../ssr/ssr-scope";
import { isServer } from "./is-server";

/**
 * Executes a function only in the server environment (SSR).
 * If the function returns a Promise, it is automatically tracked by the
 * current SSR scope to be awaited before the final HTML is generated.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the server
 * @returns {T} The result of the function
 */
export const inServer = <T>(fn: () => T): T => {
  if (!isServer() && !import.meta.env.SSR) {
    return false as T;
  }

  const result = fn();

  // Automatically track async work in SSR scope so renderToString can await it
  if (result instanceof Promise) {
    getSSRScope()?.addPromise(result);
  }

  return result;
};
