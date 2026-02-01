import type { CleanupFunction } from "../types";
import { getCurrentPath } from "./get-current-path";

/**
 * Initialize Seidr router.
 * @param {string} path - Current URL path
 * @returns {CleanupFunction} Cleanup function that stops listening to path change events.
 */
export function initRouter(path?: string): CleanupFunction {
  // Set the initial path value
  const currentPath = getCurrentPath();
  console.log("CURRENT PATH:", path ?? currentPath.value);
  if (path !== undefined) {
    currentPath.value = path;
  }

  // Return noop in SSR
  if (typeof window === "undefined") {
    return () => {};
  }

  // Handle history.back
  const popStateHandler = () => {
    currentPath.value = window.location.pathname;
  };
  window.addEventListener("popstate", popStateHandler);

  // Return cleanup function (capture window reference for closure)
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", popStateHandler);
    }
  };
}
