import { isClient } from "../util/environment/client";
import { getCurrentPath } from "./get-current-path";

/**
 * Navigate to path.
 * @param {string} path
 */
export const navigate = (path: string): void => {
  // window.location.pathname doesn't include these, but navigate() might receive them
  const currentPath = getCurrentPath();
  currentPath.value = path;

  // Push path to history
  if (isClient()) {
    window.history.pushState({}, "", path);
  }
};
