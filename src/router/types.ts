import type { ComponentFactoryFunction } from "../component/types";

/**
 * Route definition for Router.
 */
export type RouteDefinition = [
  pattern: string | RegExp,
  factory: ComponentFactoryFunction,
];
