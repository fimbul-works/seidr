import { setAppStateProvider } from "../app-state/app-state";
import { contextLocalStorage } from "../app-state/app-state.ssr";
import { createAppState } from "../app-state/storage";
import type { AppState } from "../app-state/types";

// Set up a simple browser app state that returns a valid state object
export const testAppState: AppState = createAppState(0);
testAppState.isSSR = false;

/**
 * Set the app state ID for tests.
 */
export const setAppStateID = (id: number): void => {
  testAppState.ctxId = id;
};

/**
 * Clears the test app state data and markers.
 * Does NOT reset IDs to avoid collisions with top-level observables.
 */
export const clearTestAppState = (): void => {
  testAppState.data.clear();
  testAppState.markers.clear();
  testAppState.isSSR = false;
};

/**
 * Robust getAppState for tests.
 * Prefers AsyncLocalStorage ONLY during renderToString (identified by SEIDR_TEST_SSR) to ensure correct state isolation.
 * Falls back to testAppState.
 */
export const getAppState = (): AppState => {
  if (process.env.SEIDR_TEST_SSR) {
    return contextLocalStorage.getStore() ?? testAppState;
  }
  return testAppState;
};

/**
 * Initializes the app state for testing.
 */
export function setupAppState() {
  setAppStateProvider(getAppState);
}
