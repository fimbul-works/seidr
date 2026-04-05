import { createAppState } from "./storage";
import type { AppState } from "./types";

/** Key that is shared across build targets */
const PROVIDER_KEY = "__SEIDR_APP_STATE_PROVIDER__";

/** Default application state */
const defaultAppState: AppState = createAppState(0);

/** AppState provider is shared across built bundles */
if (!globalThis[PROVIDER_KEY]) {
  globalThis[PROVIDER_KEY] = () => defaultAppState;
}

/**
 * Get the current application state.
 *
 * @returns {AppState} AppState object.
 */
export const getAppState = (): AppState => globalThis[PROVIDER_KEY]!();

/**
 * Cross-environment getAppState contract dependency injector.
 *
 * @param {(() => AppState)} fn
 * @internal
 */
export const setAppStateProvider = (fn: () => AppState) => {
  globalThis[PROVIDER_KEY] = fn;
};

/**
 * Set the application state ID (used during hydration to match server-side IDs).
 * @param {number} id - The state ID from the server
 * @internal
 */
export const setAppStateID = (id: number) => {
  const state = getAppState();
  state.ctxID = id;
  state.cid = 0;
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
export const getNextSeidrId = (): number => getAppState().cid++ + 1;
