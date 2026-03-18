import type { AppState } from "./types";
import { createAppState } from "./storage";

const defaultAppState: AppState = createAppState(0)

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
export const setInternalAppState: (fn: () => AppState) => void = (fn: () => AppState) => {
  getAppState = fn;
};

/**
 * Set the application state ID (used during hydration to match server-side IDs).
 * @param {number} id - The state ID from the server
 * @internal
 */
export const setAppStateID = (id: number) => {
  const state = getAppState();
  state.ctxID = id;
  state.sID = 0;
  state.cID = 0;
  // state.data.clear(); // Removed: Wipes out hydration data!
  state.markers.clear();
};

/**
 * Get the current application state ID.
 *
 * @returns {number} The state ID.
 */
export const getAppStateID = () => getAppState().ctxID;

/**
 * Gets the next available Seidr ID for the AppState.
 * @returns {number} The next available Seidr ID
 */
export const getNextSeidrId = (): number => getAppState().sID++ + 1;

/**
 * Gets the next available component ID for the AppState.
 * @returns {number} The next available component ID
 */
export const getNextComponentId = (): number => getAppState().cID++ + 1;
