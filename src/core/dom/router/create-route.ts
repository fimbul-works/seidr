import type { Seidr } from "../../seidr";
import type { SeidrComponent } from "../component";

/**
 * Route definition for Router.
 */
export interface RouteDefinition<C extends SeidrComponent, P extends Seidr<any>> {
  pattern: string | RegExp;
  componentFactory: (params?: P) => C;
}

/**
 * Create a route definition for use with Router.
 *
 * Helper function to create type-safe route definitions with proper TypeScript inference.
 *
 * @template {SeidrComponent<any>} C - The component type
 * @template {Seidr<any>} P - The params observable type
 * @param {string | RegExp} pattern - Path pattern or RegExp
 * @param {C | (params?: P) => C} componentOrFactory - The component (created with component()) or a factory function that returns a component
 * @returns {RouteDefinition<C, P>} Route definition object
 *
 * @example
 * Creating a route without params
 * ```typescript
 * import { createRoute, component, $div } from '@fimbul-works/seidr';
 *
 * const HomePage = component(() => $div({ textContent: 'Home' }));
 *
 * const route = createRoute('/', HomePage);
 * ```
 *
 * @example
 * Creating a route with params
 * ```typescript
 * import { createRoute, component, $div } from '@fimbul-works/seidr';
 *
 * const UserPage = (params: Seidr<{id: string}>) => component(() => {
 *   return $div({ textContent: params.as((p) => `User ${p.id}`) || 'Loading' });
 * });
 *
 * const route = createRoute('/user/:id', UserPage);
 * ```
 */
export function createRoute<C extends SeidrComponent>(
  pattern: string | RegExp,
  componentFactory: (params: Seidr<any>) => C,
): RouteDefinition<C, any> {
  return { pattern, componentFactory };
}
