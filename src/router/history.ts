import { isClient } from "../util/environment/is-client.js";
import { getRouterState } from "./get-router-state.js";
import type { History } from "./types.js";

/**
 * Create a history navigator.
 *
 * @returns {History} History instance
 */
export const history = (): History => {
  const url = getRouterState().url;

  // Initialize history with the current URL
  const history: string[] = [url().href];
  let historyIndex = 0;

  return {
    push: (location: string) => {
      // Remove all history entries after the current index
      history.splice(historyIndex + 1);

      if (isClient()) {
        window.history.pushState({}, "", location);
      }

      history.push(location);
      historyIndex++;

      url(new URL(location, url()));
    },
    replace: (location: string) => {
      if (isClient()) {
        window.history.replaceState({}, "", location);
      }

      // Replace the current history entry
      history[historyIndex] = location;

      url(new URL(location, url()));
    },
    go: (delta: number) => {
      if (isClient()) {
        window.history.go(delta);
      }

      // Move in history
      historyIndex += delta;
      if (historyIndex < 0) {
        historyIndex = 0;
      }
      if (historyIndex >= history.length) {
        historyIndex = history.length - 1;
      }

      url(new URL(history[historyIndex], url()));
    },
  };
};
