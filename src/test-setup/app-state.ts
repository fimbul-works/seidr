import type { AppState } from "../app-state";

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
};

/**
 * Set the app state ID for tests.
 */
export const setAppStateID = (id: number): void => {
  testAppState.ctxID = id;
};

/**
 * Clears the test app state.
 */
export const clearTestAppState = (): void => {
  testAppState.ctxID = 0;
  testAppState.sID = 0;
  testAppState.cID = 0;
  testAppState.data.clear();
  testAppState.markers.clear();
};

/**
 * Robust getAppState for tests.
 * Prefers AsyncLocalStorage if available (SSR), falls back to testAppState.
 */
export const getAppState = (): AppState => (global as any).__SEIDR_CONTEXT_STORE__?.getStore() ?? testAppState;
