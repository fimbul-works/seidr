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
  if (!isServer()) {
    return false as T;
  }

  const scope = getSSRScope();
  if (scope) {
    const index = scope.callIndex;
    scope.callIndex = index + 1;

    if (scope.hasCachedResult(index)) {
      return scope.getCachedResult(index);
    }

    const result = fn();

    if (result instanceof Promise) {
      scope.addPromise(
        result.then((val) => {
          scope.setCachedResult(index, val);
          return val;
        }),
      );
    } else {
      scope.setCachedResult(index, result);
    }

    return result;
  }

  return fn();
};
