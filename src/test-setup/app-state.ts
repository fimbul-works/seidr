import { setAppStateProvider } from "../app-state/app-state.js";
import { contextLocalStorage } from "../app-state/app-state.ssr.js";
import { createAppState } from "../app-state/create-app-state.js";
import type { AppState } from "../app-state/types.js";

// Set up a simple browser app state that returns a valid state object
export const testAppState: AppState = createAppState(0);

/**
 * Set the app state ID for tests.
 */
export function setAppStateID(id: number) {
  testAppState.ctxID = id;
  clearTestAppState();
}

/**
 * Clears the test app state data and markers.
 * Does NOT reset IDs to avoid collisions with top-level observables.
 */
export function clearTestAppState() {
  // Clean up data
  testAppState.destroy();
  testAppState.isSSR = false;
}

/**
 * Robust getAppState for tests.
 * Prefers AsyncLocalStorage ONLY during renderToString (identified by SEIDR_TEST_SSR) to ensure correct state isolation.
 * Falls back to testAppState.
 */
export function getAppState() {
  if (process.env.SEIDR_TEST_SSR) {
    return contextLocalStorage.getStore() ?? testAppState;
  }
  return testAppState;
}

/**
 * Initializes the app state for testing.
 */
export function setupAppState() {
  setAppStateProvider(getAppState);
}

/**
 * Resets the next available ID for the AppState.
 * Used in tests to ensure consistent IDs.
 */
export const resetNextId = (): void => {
  try {
    getAppState().seidrIdCounter = 0;
  } catch (_e) {
    // Ignore if no app state is available
  }
};
