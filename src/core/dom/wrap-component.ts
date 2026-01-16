import { isSeidrComponentFactory } from "../util";
import { component, type SeidrComponentFactory } from "./component";
import type { SeidrNode } from "./element";

/**
 * Ensures a factory function is wrapped as a SeidrComponentFactory.
 * If already wrapped, returns as-is. Otherwise wraps with component().
 *
 * @template P - The props type of the factory
 * @param {(props?: P) => SeidrNode | SeidrComponentFactory<P>} factory - Factory function or component factory
 * @returns {SeidrComponentFactory<P>} A SeidrComponentFactory
 */
export function wrapComponent<P = any>(
  factory: (props?: P) => SeidrNode | SeidrComponentFactory<P>,
): SeidrComponentFactory<P> {
  return isSeidrComponentFactory<P>(factory) ? factory : component<P>(factory as any);
}
