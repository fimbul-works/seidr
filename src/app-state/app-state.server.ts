import { AsyncLocalStorage } from "node:async_hooks";
import { type CleanupFunction, SeidrError } from "../types";
import { setInternalAppState } from "./app-state";
import type { AppState } from "./types";
import { createAppState } from "./storage";

/** Global fallback store for request ID generation */
let requestIdCounter = 0;

/** Reset the global ID counter (for testing) */
export const resetRequestIdCounter = () => (requestIdCounter = 0);

/** Storage for per-request AppState */
export const contextLocalStorage = new AsyncLocalStorage<AppState>();

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
// setInternalAppState(getSSRAppState); // Removed side-effect

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

  const context: AppState = createAppState(ctxID)
  context.isSSR = true;

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
  const mockContext: AppState = createAppState(0)
  mockContext.isSSR = true;

  const originalGetAppState = getSSRAppState;

  // Override with a simple function that always returns the mock context
  setInternalAppState(() => mockContext);

  // Return cleanup function to restore original
  return () => setInternalAppState(originalGetAppState);
};
