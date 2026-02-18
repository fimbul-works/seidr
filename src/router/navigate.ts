import { isClient } from "../util/environment/client";
import { getCurrentPath } from "./get-current-path";

/**
 * Navigate to path.
 * @param {string} path
 */
export const navigate = (path: string): void => {
  // Strip hash and query string for routing purposes
  // window.location.pathname doesn't include these, but navigate() might receive them
  const cleanPath = path.split(/[?#]/)[0];
  const currentPath = getCurrentPath();
  currentPath.value = cleanPath;

  // Push path to history
  if (isClient()) {
    window.history.pushState({}, "", cleanPath);
  }
};
