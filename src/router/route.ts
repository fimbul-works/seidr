import type { SeidrComponent, SeidrComponentFactoryFunction } from "../component";
import { Conditional } from "../components/conditional";
import type { Seidr } from "../seidr";
import { getCurrentPath } from "./get-current-path";
import { parseRouteParams } from "./parse-route-params";

/**
 * Conditionally mount a SeidrComponent when current URL path matches pattern
 *
 * @template {Record<string, string>} T - The type of matching route parameters
 * @template {Seidr<T> | false} P - The type of matching route parameters
 * @template {SeidrComponentFactoryFunction<P>} C - The type of component factory
 *
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {C} factory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {SeidrComponent} Conditional component that mounts when matched
 */
export const Route = <
  T extends Record<string, string> = Record<string, string>,
  P extends Seidr<T> = Seidr<T>,
  C extends SeidrComponentFactoryFunction<P> = SeidrComponentFactoryFunction<P>,
>(
  pattern: string | RegExp,
  factory: C,
  pathState: Seidr<string> = getCurrentPath(),
): SeidrComponent => {
  let routeParams: Seidr<T | false>;

  if (pattern instanceof RegExp) {
    // Match pathState.value against RegExp pattern
    routeParams = pathState.as<T | false>((path) => {
      const match = path.match(pattern);
      return match ? ((match.groups ?? {}) as T) : false;
    });
  } else {
    // Attempt to match path with pattern
    routeParams = pathState.as<T | false>((path) => parseRouteParams(pattern, path));
  }

  const isMatch = routeParams.as((params) => !!params);
  return Conditional(isMatch, () => factory(routeParams as P), null, "Route");
};
