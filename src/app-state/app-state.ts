import { encodeBase62 } from "@fimbul-works/futhark";
import { useScope } from "../component/use-scope.js";
import { isServer } from "../util/environment/is-server.js";
import { isSeidr } from "../util/type-guards/observable-types.js";
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
  state.ctxID = id;
  state.seidrIdCounter = 0;

  // Clean up data
  state.data.forEach((value) => isSeidr(value) && value.destroy());
  state.data.clear();

  // Remove markers
  state.markers.forEach(([a, b]) => (a.remove(), b.remove()));
  state.markers.clear();
};

/**
 * Gets the next available Seidr ID for the AppState.
 * @returns {string} The next available Seidr ID
 */
export const getNextSeidrId = (): string => {
  try {
    const scope = useScope();
    return `${scope.id}-${encodeBase62(scope.nextSeidrId())}`;
  } catch {
    if (isServer()) {
      console.warn(
        "[getNextSeidrId] Warning: Generating Seidr ID outside of component scope. This can lead to non-deterministic IDs and hydration mismatches. Please ensure all Seidr instances are created within a component.",
      );
    }
  }
  return encodeBase62(getAppState().seidrIdCounter++);
};
