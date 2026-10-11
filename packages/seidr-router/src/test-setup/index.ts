import { getAppState } from "@fimbul-works/seidr";
import { setupTestLifecycle } from "@fimbul-works/seidr/testing";
import { DATA_KEY_BROWSER_ROUTER, DATA_KEY_ROUTER } from "../constants.js";

setupTestLifecycle();

/**
 * Clear cached path from AppState.
 * Used for testing.
 */
export const clearRouterState = () => {
  const appState = getAppState();
  appState.deleteData(DATA_KEY_ROUTER);
  appState.deleteData(DATA_KEY_BROWSER_ROUTER);
};
