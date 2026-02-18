import { isComponentFactory } from "../util/type-guards/seidr-dom-types";
import { component } from "./component";
import type { ComponentFactory, ComponentFactoryFunction } from "./types";

/**
 * Ensures a factory function is wrapped as a ComponentFactory.
 * If already wrapped, returns as-is. Otherwise wraps with component().
 *
 * @template P - The props type of the factory
 * @param {ComponentFactoryFunction<P>} factory - Factory function or component factory
 * @returns {ComponentFactory<P>} A ComponentFactory
 */
export const wrapComponent = <P = void>(factory: ComponentFactoryFunction<P>): ComponentFactory<P> =>
  isComponentFactory<P>(factory) ? factory : component<P>(factory);
