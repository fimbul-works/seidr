import { getCurrentPath } from "./get-current-path";

/**
 * Navigate to path.
 * @param {string} path
 */
export function navigate(path: string): void {
  // Strip hash and query string for routing purposes
  // window.location.pathname doesn't include these, but navigate() might receive them
  const cleanPath = path.split(/[?#]/)[0];

  // Set the new path
  const currentPath = getCurrentPath();
  currentPath.value = cleanPath;

  // Stop in SSR
  if (typeof window === "undefined") {
    return;
  }

  // Push path to history
  window.history.pushState({}, "", cleanPath);
}
