import { assignProp } from "./assign-prop.js";
import type { SeidrElementProps, SeidrElementTagNameMap } from "./types.js";

/**
 * Assigns properties to an element.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {SeidrElementTagNameMap[K]} E - Element type
 * @param {E} el - Element to assign properties to
 * @param {SeidrElementProps<K>} props - Properties to assign
 */
export const assignProps = <
  K extends keyof SeidrElementTagNameMap,
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
>(
  el: E,
  props: SeidrElementProps<K>,
): void => Object.entries(props).forEach(([prop, value]) => assignProp(el, prop, value));
