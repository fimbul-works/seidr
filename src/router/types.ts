import type { ComponentFactoryFunction } from "../component/types.js";

/**
 * Route definition for Router.
 */
export type RouteDefinition = [pattern: string | RegExp, factory: ComponentFactoryFunction];
