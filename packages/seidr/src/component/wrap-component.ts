import { createComponent } from "./create-component.js";
import { isComponentFactory } from "./type-guards.js";
import type { SeidrComponentFactory, SeidrComponentFactoryPureFunction } from "./types.js";

/**
 * Ensures a function is wrapped as a ComponentFactory.
 * If the provided parameter is already a factory, it returns it unchanged.
 *
 * @template P - The props type
 * @param {SeidrComponentFactoryPureFunction<P> | SeidrComponentFactory<P>} factory - A pure function or a `ComponentFactory`
 * @param {string} [name] - Optional name to assign the component if it isn't already wrapped
 * @returns {SeidrComponentFactory<P>} The wrapped `ComponentFactory`
 */
export const wrapComponent = <P = void>(
  factory: SeidrComponentFactoryPureFunction<P> | SeidrComponentFactory<P>,
  name?: string,
): SeidrComponentFactory<P> => (isComponentFactory<P>(factory) ? factory : createComponent<P>(factory, name));
