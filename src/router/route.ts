import type { SeidrComponent } from "src/component";
import { Conditional } from "../components/conditional";
import type { SeidrNode } from "../element/types";
import type { Seidr } from "../seidr";
import { getCurrentPath } from "./get-current-path";
import { parseRouteParams } from "./parse-route-params";

/**
 * Conditionally mount a SeidrComponent when current URL path matches pattern
 *
 * IMPORTANT: The componentFactory must be a factory function (not an instantiated component).
 * When you call component() without the trailing (), you get a factory that can be called
 * multiple times to create new instances. This is required because routes need to create
 * fresh component instances each time the route changes.
 * Conditionally mount a SeidrNode when the current URL path matches the pattern.
 * The `factory` function will be called to create the SeidrNode when the route matches.
 *
 * @template {SeidrNode} C - The type of SeidrNode being conditionally rendered
 * @template {Seidr} P - The type of matching route parameters
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {(params?: P) => C} factory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {SeidrComponent} Conditional component that mounts when matched
 */
export function Route<C extends SeidrNode, P extends Seidr>(
  pattern: string | RegExp,
  factory: (params?: P) => C,
  pathState: Seidr<string> = getCurrentPath(),
): SeidrComponent {
  let routeParams: Seidr<Record<string, string> | false>;

  if (pattern instanceof RegExp) {
    // Match pathState.value against RegExp pattern
    routeParams = pathState.as((path) => {
      const match = path.match(pattern);
      if (!match) return false;
      // Extract named groups as params
      return match.groups ?? {};
    });
  } else {
    // Attempt to match path with pattern
    routeParams = pathState.as((path) => parseRouteParams(pattern, path));
  }

  const isMatch = routeParams.as((params) => !!params);
  return Conditional(isMatch, () => factory(routeParams as P), "Route");
}
