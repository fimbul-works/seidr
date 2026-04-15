import { setAppStateProvider } from "../app-state/app-state.js";
import { contextLocalStorage } from "../app-state/app-state.ssr.js";
import { createAppState } from "../app-state/create-app-state.js";
import type { AppState } from "../app-state/types.js";
import { isSeidr } from "../util/type-guards/obserbable-types.js";

// Set up a simple browser app state that returns a valid state object
export const testAppState: AppState = createAppState(0);
testAppState.isSSR = false;

/**
 * Set the app state ID for tests.
 */
export const setAppStateID = (id: number): void => {
  testAppState.ctxID = id;
};

/**
 * Clears the test app state data and markers.
 * Does NOT reset IDs to avoid collisions with top-level observables.
 */
export const clearTestAppState = (): void => {
  // Clean up data
  testAppState.data.forEach((value) => isSeidr(value) && value.destroy());
  testAppState.data.clear();

  // Remove markers
  testAppState.markers.forEach(([a, b]) => (a?.remove(), b?.remove()));
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
