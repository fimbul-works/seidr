import type { Seidr } from "../../seidr";
import type { SeidrNode } from "../element";

/**
 * Route definition for Router.
 */
export interface RouteDefinition<C extends SeidrNode, P extends Seidr<any>> {
  pattern: string | RegExp;
  componentFactory: (params?: P) => C;
}

/**
 * Create a route definition for use with Router.
 *
 * Helper function to create type-safe route definitions with proper TypeScript inference.
 *
 * @template {SeidrNode} C - The component or element type
 * @template {Seidr<any>} P - The params observable type
 * @param {string | RegExp} pattern - Path pattern or RegExp
 * @param {(params?: P) => C} factory - Function that creates the component or element when needed
 * @returns {RouteDefinition<C, P>} Route definition object
 *
 * @example
 * Creating a route with plain functions
 * ```typescript
 * import { createRoute, $div, type Seidr } from '@fimbul-works/seidr';
 *
 * const HomePage = () => $div({ textContent: 'Home' });
 * const UserPage = (params?: Seidr<{id: string}>) =>
 *   $div({ textContent: params.as((p) => `User ${p.id}`) });
 *
 * const routes = [
 *   createRoute('/', HomePage),
 *   createRoute('/user/:id', UserPage)
 * ];
 * ```
 */
export function createRoute<C extends SeidrNode>(
  pattern: string | RegExp,
  componentFactory: (params: Seidr<any>) => C,
): RouteDefinition<C, any> {
  return { pattern, componentFactory };
}
