import { parseRouteParams } from "./parse-route-params";
import type { RouteDefinition } from "./types";

export interface RouteMatch {
  route: RouteDefinition;
  params: Record<string, string>;
  index: number;
}

/**
 * Matches a path against a list of routes.
 *
 * @param path The path to match
 * @param routes The list of routes to check
 * @returns The match result or null if no route matches
 */
export const matchRoute = (rawPath: string, routes: RouteDefinition[]): RouteMatch | null => {
  const path = rawPath.split(/[?#]/)[0];
  for (let i = 0; i < routes.length; i++) {
    const [pattern] = routes[i];
    let params: Record<string, string> | false = false;

    if (pattern instanceof RegExp) {
      const match = path.match(pattern);
      params = match ? (match.groups ? { ...match.groups } : {}) : false;
    } else {
      params = parseRouteParams(pattern, path);
    }

    if (params) {
      return {
        route: routes[i],
        params: params,
        index: i,
      };
    }
  }

  return null;
};
