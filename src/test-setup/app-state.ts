import { contextLocalStorage } from "../app-state/app-state.server";
import { setInternalAppState } from "../app-state/app-state";
import type { AppState } from "../app-state/types";
import { clearPathCache } from "../router/get-current-path";

// Set up a simple browser app state that returns a valid state object
export const testAppState: AppState = {
  ctxID: 0,
  sID: 0,
  cID: 0,
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),
  hasData(key: string) {
    return this.data.has(key);
  },
  getData<T>(key: string) {
    return this.data.get(key) as T;
  },
  setData<T>(key: string, value: T) {
    this.data.set(key, value);
  },
  deleteData(key: string) {
    return this.data.delete(key);
  },
  defineDataStrategy() {},
  getDataStrategy() {
    return undefined;
  },
  isSSR: false,
};

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
