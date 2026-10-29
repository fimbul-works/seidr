import { isNum } from "@fimbul-works/hvat";
import { navigate, SeidrError } from "@fimbul-works/seidr";
import { getRouterState } from "../get-router-state.js";

/**
 * Interface for the navigate function.
 * @param {string | number} href - Path to navigate to or number of entries to go back/forward
 * @param {boolean} [replace=false] - Whether to replace the current history entry
 */
export type NavigateFn = (href: string | number, replace?: boolean) => void;

/**
 * Returns the navigate function.
 * @returns {NavigateFn} navigate function
 */
export const useNavigate = (): NavigateFn => {
  return (href: string | number, replace = false): void => {
    // Backwards and forwards navigation
    if (isNum(href)) {
      navigate(href, { replace });
      return;
    }

    // Verify origin boundary for router's useNavigate
    const currentUrl = getRouterState().url();
    const nextUrl = new URL(href, currentUrl.href);

    if (nextUrl.origin !== currentUrl.origin) {
      throw new SeidrError("Cross-origin navigation is not allowed");
    }

    navigate(nextUrl, { replace });
  };
};
