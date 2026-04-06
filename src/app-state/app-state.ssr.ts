import { AsyncLocalStorage } from "node:async_hooks";
import { SeidrError } from "../types";
import { createAppState } from "./storage";
import type { AppState } from "./types";

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
  if (!store) {
    throw new SeidrError("AppState not initialized");
  }
  return store;
};

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

  const context: AppState = createAppState(ctxID);
  context.isSSR = true;

  return contextLocalStorage.run(context, callback);
};
