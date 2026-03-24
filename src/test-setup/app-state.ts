import { contextLocalStorage } from "../app-state/app-state.server";
import { setInternalAppState } from "../app-state/app-state";
import type { AppState } from "../app-state/types";
import { clearPathCache } from "../router/get-current-path";
import { createAppState } from "../app-state/storage";

export { DOCUMENT_PROVIDER_KEY } from "../dom/get-document";

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
  clearPathCache();
  testAppState.data.clear();
  testAppState.markers.clear();
  testAppState.isSSR = false;
};

/**
 * Robust getAppState for tests.
 * Prefers AsyncLocalStorage ONLY during renderToString (identified by __SEIDR_SSR_ACTIVE__),
 * falls back to testAppState.
 */
export const getAppState = (): AppState => {
  if ((global as any).__SEIDR_SSR_ACTIVE__) {
    return contextLocalStorage.getStore() ?? testAppState;
  }
  return testAppState;
};

/**
 * Initializes the app state for testing.
 */
export function setupAppState() {
  setInternalAppState(getAppState);
}
