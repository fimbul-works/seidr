import type { SeidrComponentFactoryFunction } from "../component/types";
import type { Seidr } from "../seidr";

/**
 * Route definition for Router.
 *
 * @template {Seidr<Record<string, string>>} P - The params observable type
 * @template {SeidrComponentFactoryFunction<P>} C - The component or element type
 */
export interface RouteDefinition<
  T extends Record<string, string> = Record<string, string>,
  P extends Seidr<T> = Seidr<T>,
  C extends SeidrComponentFactoryFunction<P> = SeidrComponentFactoryFunction<P>,
> {
  pattern: string | RegExp;
  factory: C;
}

/**
 * Create a route definition for use with Router.
 *
 * Helper function to create type-safe route definitions with proper TypeScript inference.
 *
 * @template {Seidr<Record<string, string>>} P - The params observable type
 * @template {SeidrComponentFactoryFunction<P>} C - The component or element type
 *
 * @param {string | RegExp} pattern - Path pattern or RegExp
 * @param {C} factory - Function that creates the component or element when needed
 * @returns {RouteDefinition<P, C>} Route definition object
 */
export const createRoute = <
  T extends Record<string, string> = Record<string, string>,
  P extends Seidr<T> = Seidr<T>,
  C extends SeidrComponentFactoryFunction<P> = SeidrComponentFactoryFunction<P>,
>(
  pattern: string | RegExp,
  factory: C,
): RouteDefinition<T, P, C> => ({ pattern, factory });
