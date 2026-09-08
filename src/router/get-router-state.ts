import { getAppState } from "../app-state/app-state.js";
import { SeidrError } from "../types.js";
import { DATA_KEY_ROUTER, ERROR_ROUTER_NOT_INITIALIZED } from "./constants.js";
import type { RouterState } from "./types.js";

/**
 * Retrieves the router state from the current AppState.
 *
 * @returns {RouterState} The current router state
 * @throws {SeidrError} If the router is not initialized
 */
export const getRouterState = (): RouterState => {
  const appState = getAppState();
  if (!appState.hasData(DATA_KEY_ROUTER)) {
    throw new SeidrError(ERROR_ROUTER_NOT_INITIALIZED);
  }
  return appState.getData<RouterState>(DATA_KEY_ROUTER)!;
};
