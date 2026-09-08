import { SeidrError } from "../../types.js";
import { isClient } from "../../util/environment/is-client.js";
import { isNum } from "../../util/type-guards.js";
import { getRouterState } from "../get-router-state.js";

/**
 * Interface for the navigate function.
 * @param {string | number} to - Path to navigate to or number of entries to go back/forward
 * @param {boolean} [replace=false] - Whether to replace the current history entry
 */
export type NavigateFn = (to: string | number, replace?: boolean) => void;

/**
 * Returns the navigate function.
 * @returns {NavigateFn} navigate function
 */
export const useNavigate = (): NavigateFn => {
  return (to: string | number, replace = false): void => {
    // Backwards and forwards navigation
    if (isNum(to)) {
      if (isClient()) {
        window.history.go(to);
      }
      return;
    }

    // Handle string path
    const url = getRouterState().url;
    const currentUrl = url();
    const nextUrl = new URL(to, currentUrl.href);

    if (nextUrl.origin !== currentUrl.origin) {
      throw new SeidrError("Cross-origin navigation is not allowed");
    }

    url(nextUrl);

    // Handle client-side navigation
    if (isClient()) {
      if (nextUrl.href !== currentUrl.href) {
        window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl.href);
      }
    }
  };
};
