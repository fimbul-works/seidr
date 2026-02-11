import { isSeidrComponentFactory } from "../util/type-guards/seidr-dom-types";
import { component } from "./component";
import type { SeidrComponentFactory, SeidrComponentFactoryFunction } from "./types";

/**
 * Ensures a factory function is wrapped as a SeidrComponentFactory.
 * If already wrapped, returns as-is. Otherwise wraps with component().
 *
 * @template P - The props type of the factory
 * @param {SeidrComponentFactoryFunction<P>} factory - Factory function or component factory
 * @returns {SeidrComponentFactory<P>} A SeidrComponentFactory
 */
export const wrapComponent = <P = void>(factory: SeidrComponentFactoryFunction<P>): SeidrComponentFactory<P> =>
  isSeidrComponentFactory<P>(factory) ? factory : component<P>(factory);
