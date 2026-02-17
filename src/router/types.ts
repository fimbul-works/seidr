import type { SeidrComponentFactoryFunction } from "../component/types";
import type { Seidr } from "../seidr/seidr";

/**
 * Route definition for Router.
 *
 * @template {Seidr<Record<string, string>>} P - The params observable type
 * @template {SeidrComponentFactoryFunction<P>} C - The component or element type
 */
export type RouteDefinition<
  T extends Record<string, string> = Record<string, string>,
  P extends Seidr<T> = Seidr<T>,
  C extends SeidrComponentFactoryFunction<void | P> = SeidrComponentFactoryFunction<void | P>,
> = [pattern: string | RegExp, factory: C];
