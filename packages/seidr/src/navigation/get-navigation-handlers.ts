import { getAppState } from "../app-state/get-app-state.js";
import { DATA_KEY_NAVIGATION_HANDLERS } from "./constants.js";
import type { NavigationHandler } from "./types.js";

/**
 * Returns a copy of the currently registered navigation handlers.
 *
 * @returns List of registered handlers
 * @internal
 */
export const getNavigationHandlers = (): NavigationHandler[] =>
  getAppState().getData<NavigationHandler[]>(DATA_KEY_NAVIGATION_HANDLERS, []).slice(0);
