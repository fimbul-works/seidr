import { isComponentFactory } from "../util/type-guards/component-types";
import { component } from "./component";
import type { ComponentFactory, ComponentFactoryFunction } from "./types";

/**
 * Ensures a function is wrapped as a ComponentFactory.
 * If the provided parameter is already a factory, it returns it unchanged.
 *
 * @template P - The props type
 * @param {ComponentFactoryFunction<P>} factory - A pure function or a ComponentFactory
 * @param {string} [name] - Optional name to assign the component if it isn't already wrapped
 * @returns {ComponentFactory<P>} The wrapped ComponentFactory
 */
export const wrapComponent = <P = void>(factory: ComponentFactoryFunction<P>, name?: string): ComponentFactory<P> =>
  isComponentFactory<P>(factory) ? factory : component<P>(factory, name);
