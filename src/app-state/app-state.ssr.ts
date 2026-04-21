import { AsyncLocalStorage } from "node:async_hooks";
import { SeidrError } from "../types.js";
import { createAppState } from "./create-app-state.js";
import type { AppState } from "./types.js";

/** Global fallback store for request ID generation */
let requestIdCounter = 0;

/** Storage for per-request AppState */
export const contextLocalStorage = new AsyncLocalStorage<AppState>();

/**
 * Get the current application state.
 *
 * @return {AppState}
 * @throws {SeidrError} when AppState is not initialized
 */
export function getSSRAppState(): AppState {
  const store = contextLocalStorage.getStore();
  if (!store) {
    throw new SeidrError("AppState not initialized");
  }
  return store;
}

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
  const ctxID = ++requestIdCounter;

  if (requestIdCounter > 2**53) {
    requestIdCounter = 0;
  }

  const context: AppState = createAppState(ctxID);
  if (process.env.VITEST) {
    context.isSSR = true;
  }

  return contextLocalStorage.run(context, callback);
};

/**
 * Reset the global ID counter.
 * Used in testing.
 */
export const resetRequestIdCounter = () => (requestIdCounter = 0);
