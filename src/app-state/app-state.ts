import { encodeBase62 } from "@fimbul-works/futhark";
import { useScope } from "../component";
import { isServer } from "../util";
import { createAppState } from "./storage";
import type { AppState } from "./types";

/** Key that is shared across build targets */
export const PROVIDER_KEY = "__SEIDR_APP_STATE_PROVIDER__";

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
  state.seidrIdCounter = 0;
  state.markers.clear();
  state.data.clear();
};

/**
 * Get the current application state ID.
 *
 * @returns {number} The state ID.
 */
export const getAppStateID = () => getAppState().ctxID;

/**
 * Gets the next available Seidr ID for the AppState.
 * @returns {string} The next available Seidr ID
 */
export const getNextSeidrId = (): string => {
  try {
    const scope = useScope();
    if (scope) {
      return `${scope.id}-${encodeBase62(scope.nextSeidrId())}`;
    }
  } catch {
    if (isServer() && !process.env.VITEST) {
      console.warn(
        "[getNextSeidrId] Warning: Generating Seidr ID outside of component scope. This can lead to non-deterministic IDs and hydration mismatches. Please ensure all Seidr instances are created within a component.",
      );
    }
  }
  return encodeBase62(getAppState().seidrIdCounter++);
};
