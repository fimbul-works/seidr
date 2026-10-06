import { parseRouteParams } from "./parse-route-params.js";
import type { Route, RouteMatch } from "./types.js";

/**
 * Matches a path against a list of routes.
 *
 * @param {string} rawPath - The path to match
 * @param {Route[]} routes - The list of routes to check
 * @returns {RouteMatch | null} The match result or null if no route matches
 */
export const matchRoute = (rawPath: string, routes: Route[]): RouteMatch | null => {
  // Extract pathname from rawPath (remove query and hash)
  const pathname = rawPath.split(/[?#]/)[0];

  for (let index = 0; index < routes.length; index++) {
    const { path: pattern } = routes[index];
    let params: Record<string, string> | false = false;
    let matchedPath = "";

    if (pattern instanceof RegExp) {
      const match = pathname.match(pattern);
      if (match) {
        params = match.groups ? { ...match.groups } : {};
        matchedPath = match[0];
      }
    } else {
      params = parseRouteParams(pattern, pathname, routes[index].exact);
      if (params) {
        const patternParts = pattern.split("/").filter(Boolean);
        const pathnameParts = pathname.split("/").filter(Boolean);
        const hasWildcard = patternParts[patternParts.length - 1] === "*";
        const matchLength = hasWildcard ? patternParts.length - 1 : patternParts.length;
        matchedPath = `/${pathnameParts.slice(0, matchLength).join("/")}`;
        if (matchedPath === "/") matchedPath = ""; // Normalize root
      }
    }

    if (params) {
      return {
        index,
        route: routes[index],
        params,
        matchedPath,
      };
    }
  }

  return null;
};
