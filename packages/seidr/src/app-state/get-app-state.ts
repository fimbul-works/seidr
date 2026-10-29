import { clearComponentRegistry } from "../component/component-registry.js";
import { AppState } from "./class-app-state.js";

/** Default application state */
const defaultAppState = new AppState(0);

/**
 * Get the current application state.
 *
 * @returns The current application state.
 */
export let getAppState = (): AppState => defaultAppState;

/**
 * Cross-environment getAppState contract dependency injector.
 *
 * @param fn - AppState getter.
 * @internal
 */
export const setAppStateProvider = (fn: () => AppState) => {
  getAppState = fn;
};

/**
 * Set the application state ID (used during hydration to match server-side IDs).
 *
 * @param id - The state ID from the server.
 * @internal
 */
export const setAppStateID = (id: number) => {
  const state = getAppState();
  state.destroy();
  clearComponentRegistry();
  (state as any).ctxID = id;
};
