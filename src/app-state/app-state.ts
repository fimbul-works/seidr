import { encodeBase62 } from "@fimbul-works/futhark";
// import { useScope } from "../component/use-scope.js";
// import { isServer } from "../util/environment/is-server.js";
import { createAppState } from "./create-app-state.js";
import type { AppState } from "./types.js";
import { getComponentScope } from "../component/lifecycle/component-scope.js";
import { isServer } from "../util/environment/is-server.js";

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
  state.uniqID = 0;
  state.destroy();
};

/**
 * Gets the next available Value ID for the AppState.
 * @returns {string} The next available Value ID
 */
export const getNextValueId = (): string => {
  const scope = getComponentScope();
  if (scope) {
    return `${encodeBase62(scope.id)}-${encodeBase62(scope.nextValueId)}`;
  }

  if (isServer()) {
    console.warn(
      "[getNextValueId] Warning: Generating Value ID outside of component scope. This can lead to non-deterministic IDs and hydration mismatches. Please ensure all Value instances are created within a component.",
    );
  }

  return encodeBase62(getAppState().uniqID++);
};
