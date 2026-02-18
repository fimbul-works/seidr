import type { ComponentFactoryFunction } from "../component/types";
import type { Seidr } from "../observable/seidr";

/**
 * Route definition for Router.
 *
 * @template {Record<string, string>} T - The params type
 * @template {Seidr<T>} P - The params observable type
 * @template {ComponentFactoryFunction<P>} C - The component or element type
 */
export type RouteDefinition<
  T = Record<string, string>,
  P extends Seidr<T> = Seidr<T>,
  C extends ComponentFactoryFunction<P> = ComponentFactoryFunction<P>,
> = [pattern: string | RegExp, factory: C];
