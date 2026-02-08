import { isSeidrComponentFactory } from "../util/type-guards/seidr-dom-types";
import { component } from "./component";
import type { SeidrComponentChildren, SeidrComponentFactory } from "./types";

/**
 * Ensures a factory function is wrapped as a SeidrComponentFactory.
 * If already wrapped, returns as-is. Otherwise wraps with component().
 *
 * @template P - The props type of the factory
 * @param {(P extends void ? () => SeidrComponentChildren : (props: P) => SeidrComponentChildren) | SeidrComponentFactory<P>} factory - Factory function or component factory
 * @returns {SeidrComponentFactory<P>} A SeidrComponentFactory
 */
export function wrapComponent<P = void, T extends SeidrComponentChildren = SeidrComponentChildren>(
  factory: (P extends void ? () => T : (props: P) => T) | SeidrComponentFactory<P>,
): SeidrComponentFactory<P> {
  if (isSeidrComponentFactory<P>(factory)) {
    return factory as SeidrComponentFactory<P>;
  }
  return component<P>(factory);
}
