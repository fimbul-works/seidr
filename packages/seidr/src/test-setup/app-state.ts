import { AppState } from "../app-state/class-app-state.js";
import { setAppStateProvider } from "../app-state/get-app-state.js";
import { contextLocalStorage } from "../app-state/get-app-state.ssr.js";
import { clearComponentRegistry } from "../component/component-registry.js";
import { resetIdCounters } from "../hooks/use-id.js";

// Set up a simple browser app state that returns a valid state object
export const testAppState = new AppState(0);

/**
 * Set the app state ID for tests.
 */
export function setAppStateID(id: number) {
  (testAppState as any).ctxID = id;
  clearTestAppState();
}

/**
 * Clears the test app state data and markers.
 *
 * Does NOT reset IDs to avoid collisions with top-level observables.
 */
export function clearTestAppState() {
  // Clean up data
  try {
    testAppState.destroy();
    clearComponentRegistry();
  } catch {}
}

/**
 * Testing version of getAppState.
 *
 * Prefers AsyncLocalStorage ONLY during renderToString (identified by SEIDR_TEST_SSR)
 * to ensure correct state isolation.
 *
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
 * @internal
 */
export function setupAppState() {
  setAppStateProvider(getAppState);
}

/**
 * Resets the next available ID for the AppState.
 * Used in tests to ensure consistent IDs.
 */
export const resetNextId = (): void => {
  resetIdCounters();
};
