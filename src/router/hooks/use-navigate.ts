import { isClient } from "../../util/environment";
import { isNum } from "../../util/type-guards/primitive-types";
import { DUMMY_URL } from "../constants";
import { getCurrentPath } from "../get-current-path";

/**
 * Interface for the navigate function.
 * @param {string | number} to - Path to navigate to or number of entries to go back/forward
 * @param {boolean} replace - Whether to replace the current history entry
 */
export type NavigateFn = (to: string | number, replace?: boolean) => void;

/**
 * Returns the navigate function.
 * @returns {NavigateFn} navigate function
 */
export const useNavigate = (): NavigateFn => {
  const currentPath = getCurrentPath();

  return (to: string | number, replace = false): void => {
    if (isNum(to)) {
      if (isClient()) {
        window.history.go(to);
      }
      return;
    }

    // Handle string path
    let targetPath = to;

    if (isClient()) {
      // Resolve relative path using window.location as base
      const url = new URL(to, window.location.href);
      targetPath = url.pathname + url.search + url.hash;

      if (targetPath !== window.location.pathname + window.location.search + window.location.hash) {
        window.history[replace ? "replaceState" : "pushState"]({}, "", targetPath);
      }
    } else {
      // Server-side: Resolve relative path using current path as base
      // Use a dummy origin for URL resolution
      const url = new URL(to, `${DUMMY_URL}${currentPath.value}`);
      targetPath = url.pathname + url.search + url.hash;
    }

    // Update the reactive path state
    currentPath.value = targetPath;
  };
};
