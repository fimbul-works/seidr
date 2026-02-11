import type { RouteDefinition } from "./create-route";
import { parseRouteParams } from "./parse-route-params";

export interface RouteMatch<P = Record<string, string>> {
  route: RouteDefinition<any, any>;
  params: P;
  index: number;
}

/**
 * Matches a path against a list of routes.
 *
 * @param path The path to match
 * @param routes The list of routes to check
 * @returns The match result or null if no route matches
 */
export const matchRoute = (path: string, routes: RouteDefinition<any, any>[]): RouteMatch | null => {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    let params: Record<string, string> | false = false;

    if (route.pattern instanceof RegExp) {
      const match = path.match(route.pattern);
      params = match ? (match.groups ?? {}) : false;
    } else {
      params = parseRouteParams(route.pattern, path);
    }

    if (params) {
      return {
        route,
        params: params as any,
        index: i,
      };
    }
  }

  return null;
};
