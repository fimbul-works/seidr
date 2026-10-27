import { parseRouteParams } from "../parse-route-params.js";

/**
 * Checks whether a destination route is active given the current URL and optional local pathname.
 *
 * @param {string} href - Target link path or URL
 * @param {URL} currentUrl - Current active URL
 * @param {string} localPathname - Optional local pathname in nested routers
 * @param {string} ancestorPrefix - Optional prefix matched by ancestor routers
 * @param {boolean} exact - Whether the match must be exact
 * @returns {boolean} True if the link is active
 */
export const isLinkActive = (
  href: string,
  currentUrl: URL,
  localPathname?: string,
  ancestorPrefix?: string,
  exact?: boolean,
): boolean => {
  const currentPath = currentUrl?.pathname.replace(/\/+$/, "") || "/";

  // Parse `to` into path, search, and hash
  const [toPathAndQuery, toHashRaw] = href.split("#");
  const [toPathRaw, toSearchRaw] = toPathAndQuery.split("?");
  const toPath = toPathRaw.replace(/\/+$/, "") || "/";

  // 1. Check Hash
  if (toHashRaw !== undefined) {
    const expectedHash = toHashRaw ? `#${toHashRaw}` : "";
    if (currentUrl.hash !== expectedHash) {
      return false;
    }
  }

  // 2. Check Query Parameters
  const toParams = new URLSearchParams(toSearchRaw || "");
  const currentParams = currentUrl.searchParams;

  if (toSearchRaw !== undefined) {
    // If query parameters were specified in `to`, all must match currentUrl
    for (const [key, value] of toParams.entries()) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }
    // If exact matching is requested, ensure no extra query parameters exist
    if (exact === true) {
      for (const [key] of currentParams.entries()) {
        if (!toParams.has(key)) {
          return false;
        }
      }
    }
  } else if (exact === true && currentUrl.search !== "") {
    // When exact === true is explicitly requested and no query params were specified,
    // currentUrl must have no query params
    return false;
  }

  // 3. Check Pathname
  const isExactPath = exact !== false;

  // Root path "/" should only match "/" unless it explicitly has a wildcard
  if (toPath === "/" && !toPathRaw.includes("*")) {
    return currentPath === "/" || localPathname === "/";
  }

  const matchCurrent = parseRouteParams(toPath, currentPath, isExactPath) !== false;
  const matchLocal = localPathname
    ? parseRouteParams(toPath, localPathname.replace(/\/+$/, "") || "/", isExactPath) !== false
    : false;

  let matchPrefix = false;
  if (ancestorPrefix && currentPath.startsWith(ancestorPrefix)) {
    const remaining = currentPath.slice(ancestorPrefix.length) || "/";
    const normalizedRemaining = remaining.startsWith("/") ? remaining : `/${remaining}`;
    matchPrefix = parseRouteParams(toPath, normalizedRemaining, isExactPath) !== false;
  }

  return matchCurrent || matchLocal || matchPrefix;
};
