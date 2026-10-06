import { getRouterState } from "./get-router-state.js";
import type { PopstateListener } from "./types.js";

/**
 * Add a popstate listener to be called when the URL changes due to browser navigation (back/forward).
 * @param {PopstateListener} listener - The listener function to add
 */
export const addPopstateListener = (listener: PopstateListener) => getRouterState().popstateListeners.add(listener);

/**
 * Remove a previously added popstate listener.
 * @param {PopstateListener} listener - The listener function to remove
 */
export const removePopstateListener = (listener: PopstateListener) =>
  getRouterState().popstateListeners.delete(listener);
