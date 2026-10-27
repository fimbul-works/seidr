import { createAppState } from "./create-app-state.js";
import type { AppState } from "./types.js";

/** Default application state */
const defaultAppState: AppState = createAppState(0);

/**
 * Get the current application state.
 *
 * @returns {AppState} AppState object.
 */
export let getAppState = (): AppState => defaultAppState;

/**
 * Cross-environment getAppState contract dependency injector.
 *
 * @param {(() => AppState)} fn
 * @internal
 */
export const setAppStateProvider = (fn: () => AppState) => {
  getAppState = fn;
};

/**
 * Set the application state ID (used during hydration to match server-side IDs).
 * @param {number} id - The state ID from the server
 * @internal
 */
export const setAppStateID = (id: number) => {
  const state = getAppState();
  state.destroy();
  state.ctxID = id;
};
