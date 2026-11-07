import type { ReactiveValue } from "../element/types.js";
import type { DerivedValue } from "../observable/types.js";
import { mergeValues } from "../observable/value.js";
import { wrapValue } from "../observable/wrap-value.js";
import { getCurrentUrl } from "./current-url.js";

/**
 * Options for isUrlActive.
 */
export interface IsUrlActiveOptions {
  /** Whether the URL path match must be exact (default: false) */
  exact?: boolean;
}

/**
 * Checks whether a given target URL or path is currently active relative to getCurrentUrl().
 * Returns a DerivedValue that reactively updates whenever the current URL changes.
 *
 * @param {ReactiveValue<string | URL>} href - Target link path or URL
 * @param {IsUrlActiveOptions} [options] - Matching options
 * @returns {DerivedValue<boolean>} Reactive boolean indicating if the target URL is active
 */
export const isUrlActive = (
  href: ReactiveValue<string | URL>,
  options?: IsUrlActiveOptions,
): DerivedValue<boolean> => {
  const currentUrlValue = getCurrentUrl();
  const wrappedHref = wrapValue(href);
  const exact = options?.exact ?? false;

  return mergeValues(
    () => {
      const current = currentUrlValue();
      const rawHref = wrappedHref();
      if (!rawHref) {
        return false;
      }

      let targetUrl: URL;
      try {
        targetUrl = rawHref instanceof URL ? rawHref : new URL(String(rawHref), current.href);
      } catch {
        return false;
      }

      // Check origin
      if (targetUrl.origin !== current.origin) {
        return false;
      }

      // Normalize paths by stripping trailing slashes except for "/"
      const currentPath = current.pathname.replace(/\/+$/, "") || "/";
      const targetPath = targetUrl.pathname.replace(/\/+$/, "") || "/";

      // 1. Check Hash if target specified one
      if (targetUrl.hash) {
        if (current.hash !== targetUrl.hash) {
          return false;
        }
      }

      // 2. Check Query Parameters if target specified any
      if (targetUrl.search) {
        for (const [key, value] of targetUrl.searchParams.entries()) {
          if (current.searchParams.get(key) !== value) {
            return false;
          }
        }
        if (exact) {
          for (const key of current.searchParams.keys()) {
            if (!targetUrl.searchParams.has(key)) {
              return false;
            }
          }
        }
      } else if (exact && current.search !== "") {
        return false;
      }

      // 3. Check Pathname
      if (targetPath === "/") {
        return currentPath === "/";
      }

      if (exact) {
        return currentPath === targetPath;
      }

      return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
    },
    { parents: [currentUrlValue, wrappedHref] },
  );
};
