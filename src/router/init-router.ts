import type { CleanupFunction } from "../types";
import { isServer } from "../util/environment/server";
import { isUndefined } from "../util/type-guards/primitive-types";
import { getCurrentPath } from "./get-current-path";

/**
 * Initialize Seidr router.
 * @param {string} path - Current URL path
 * @returns {CleanupFunction} Cleanup function that stops listening to path change events.
 */
export const initRouter = (path?: string): CleanupFunction => {
  // Set the initial path value
  const currentPath = getCurrentPath();
  if (!isUndefined(path)) {
    currentPath.value = path;
  }

  // Return noop in SSR
  if (isServer()) {
    return () => {};
  }

  // Handle history.back
  const popStateHandler = () => (currentPath.value = window.location.pathname);
  window.addEventListener("popstate", popStateHandler);

  return () => window.removeEventListener("popstate", popStateHandler);
};
