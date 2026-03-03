import { AsyncLocalStorage } from "node:async_hooks";
import { type CleanupFunction, SeidrError } from "../types";
import { setInternalAppState } from "./render-context";
import type { AppState } from "./types";

/** Global fallback store for request ID generation */
let requestIdCounter = 0;

/** Reset the global ID counter (for testing) */
export const resetRequestIdCounter = () => (requestIdCounter = 0);

/** Storage for per-request AppState */
const contextLocalStorage = new AsyncLocalStorage<AppState>();

/** Global strategies map for SSR (could also be per-context if needed, but usually global) */
const strategies = new Map<string, [((value: any) => any) | undefined, ((value: any) => any) | undefined]>();

// Expose store globally for test-setup access in tests
if (process.env.VITEST && typeof global !== "undefined") {
  (global as any).__SEIDR_CONTEXT_STORE__ = contextLocalStorage;
}

/**
 * Get the current application state.
 *
 * @return {AppState}
 */
export const getSSRAppState = (): AppState => {
  const store = contextLocalStorage.getStore();
  if (!store) throw new SeidrError("AppState not initialized");
  return store;
};

// Pass the SSR getAppState to contract
setInternalAppState(getSSRAppState);

/**
 * Run a function within a new application state.
 * This must be used to wrap your SSR render function.
 *
 * @template T - Type of the promise callback resolves to
 *
 * @param {() => Promise<T>} callback - Callback to invoke inside AsyncLocalStorage closure
 * @return {Promise<T>}
 */
export const runWithAppState = async <T>(callback: () => Promise<T>): Promise<T> => {
  const ctxID = requestIdCounter++;

  const context: AppState = {
    ctxID,
    sID: 0,
    cID: 0,
    markers: new Map<string, [Comment, Comment]>(),
    data: new Map<string, any>(),

    hasData(key: string) {
      return this.data.has(key);
    },
    getData<T>(key: string) {
      return this.data.get(key) as T | undefined;
    },
    setData<T>(key: string, value: T) {
      this.data.set(key, value);
    },
    deleteData(key: string) {
      return this.data.delete(key);
    },

    defineDataStrategy<T>(key: string, captureFn: (value: T) => any, restoreFn: (value: any) => T) {
      strategies.set(key, [captureFn, restoreFn]);
    },
    getDataStrategy(key: string) {
      return strategies.get(key);
    },
  };

  return contextLocalStorage.run(context, callback);
};

/**
 * Set a mock application state for testing purposes.
 * This provides a simple browser-like app state without requiring AsyncLocalStorage.
 *
 * Use this in tests that need an app state but don't need full SSR functionality.
 *
 * @returns {CleanupFunction} Cleanup function to restore the original context
 */
export const setMockAppStateForTests = (): CleanupFunction => {
  const mockContext: AppState = {
    ctxID: 0,
    sID: 0,
    cID: 0,
    markers: new Map<string, [Comment, Comment]>(),
    data: new Map<string, any>(),

    hasData(key: string) {
      return this.data.has(key);
    },
    getData<T>(key: string) {
      return this.data.get(key) as T | undefined;
    },
    setData<T>(key: string, value: T) {
      this.data.set(key, value);
    },
    deleteData(key: string) {
      return this.data.delete(key);
    },

    defineDataStrategy<T>(key: string, captureFn: (value: T) => any, restoreFn: (value: any) => T) {
      strategies.set(key, [captureFn, restoreFn]);
    },
    getDataStrategy(key: string) {
      return strategies.get(key);
    },
  };
  const originalGetAppState = getSSRAppState;

  // Override with a simple function that always returns the mock context
  setInternalAppState(() => mockContext);

  // Return cleanup function to restore original
  return () => setInternalAppState(originalGetAppState);
};
