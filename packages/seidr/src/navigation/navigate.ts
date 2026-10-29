import { getAppState } from "../app-state/get-app-state.js";
import { DATA_KEY_NAVIGATION_HANDLERS } from "./constants.js";
import type { NavigationHandler, NavigationOptions, NavigationTarget } from "./types.js";

/**
 * Dispatches navigation through registered handlers until one returns `true`.
 *
 * @param {NavigationTarget} target - URL string, URL object, or history delta number
 * @param {NavigationOptions} [options] - Optional navigation options
 * @returns {boolean} `true` if a handler handled the navigation, `false` otherwise
 */
export function navigate(target: NavigationTarget, options?: NavigationOptions): boolean {
  const handlers = getAppState().getData<NavigationHandler[]>(DATA_KEY_NAVIGATION_HANDLERS);
  if (!handlers || handlers.length === 0) {
    return false;
  }

  for (const handler of handlers) {
    if (handler(target, options) === true) {
      return true;
    }
  }

  return false;
}
