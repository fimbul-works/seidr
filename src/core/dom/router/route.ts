import type { Seidr } from "../../seidr";
import { Conditional } from "../components/conditional";
import type { SeidrNode } from "../element";
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
 * @template {Seidr<any>} P - The type of matching route parameters
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {(params?: P) => C} factory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {SeidrComponent} Conditional component that mounts when matched
 *
 * @example
 * Route usage with plain functions
 * ```typescript
 * // Without params
 * const Home = () => $div({ textContent: 'Home' });
 * Route('/', Home)
 *
 * // With params - params are passed as a Seidr observable
 * const UserPage = (params?: Seidr<{id: string}>) =>
 *   $div({ textContent: params?.as(p => `User ${p.id}`) || 'Loading' });
 *
 * Route('/user/:id', UserPage)
 * ```
 */
export function Route<C extends SeidrNode, P extends Seidr<any>>(
  pattern: string | RegExp,
  factory: (params?: P) => C,
  pathState: Seidr<string> = getCurrentPath(),
) {
  // Match pathState.value against RegExp pattern (no parameters extracted)
  if (pattern instanceof RegExp) {
    const routeParams = pathState.as((path) => {
      const match = path.match(pattern);
      if (!match) return false;

      // Extract named groups as params
      return match.groups ?? {};
    });

    const isMatch = routeParams.as((params) => !!params);
    return Conditional(isMatch, () => factory(routeParams as P));
  }

  // Attempt to match path with pattern (parseRouteParams handles normalization)
  const routeParams = pathState.as((path) => parseRouteParams(pattern, path));

  // Mount if params are truthy
  const match = routeParams.as((params) => !!params);
  return Conditional(match, () => factory(routeParams as P));
}
