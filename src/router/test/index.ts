import { getAppState } from "../../app-state/app-state.js";
import { DATA_KEY_BROWSER_ROUTER, DATA_KEY_HASH_ROUTER, DATA_KEY_ROUTER } from "../constants.js";

/**
 * Clear cached path from AppState.
 * Used for testing.
 */
export const clearRouterState = () => {
  const appState = getAppState();
  appState.deleteData(DATA_KEY_ROUTER);
  appState.deleteData(DATA_KEY_BROWSER_ROUTER);
  appState.deleteData(DATA_KEY_HASH_ROUTER);
};
