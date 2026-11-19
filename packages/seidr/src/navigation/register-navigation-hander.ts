import { getAppState } from "../app-state/get-app-state.js";
import { type PropMutator, registerPropMutator } from "../element/prop-mutators.js";
import { DATA_KEY_NAVIGATION_HANDLERS } from "./constants.js";
import { handleLinkProps } from "./handle-link-props.js";
import type { NavigationHandler } from "./types.js";

/**
 * Registers a navigation handler with the active AppState.
 * Handlers are executed in registration order until one returns `true`.
 *
 * @param {NavigationHandler} handler - The handler function to register
 * @returns {() => void} An unregister function to remove the handler
 */
export function registerNavigationHandler(handler: NavigationHandler): () => void {
  const handlers = getAppState().getData<NavigationHandler[]>(DATA_KEY_NAVIGATION_HANDLERS, []);
  const idx = handlers.indexOf(handler);

  // Register link handler
  const unregisterMutator = registerPropMutator("href", handleLinkProps as PropMutator);

  const unregister = () => {
    const removeIdx = handlers.indexOf(handler);
    if (removeIdx !== -1) {
      handlers.splice(removeIdx, 1);
      if (handlers.length === 0) {
        unregisterMutator();
      }
    }
  };

  if (idx !== -1) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Navigation handler already registered");
    }

    return unregister;
  }

  handlers.push(handler);
  return unregister;
}
