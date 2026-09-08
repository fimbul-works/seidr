import { assignProp } from "./assign-prop.js";
import type { PropName, SeidrElementProps } from "./types.js";

/**
 * Assigns properties to an HTMLElement.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {HTMLElementTagNameMap[K]} E - The HTMLElement type
 * @param {E} el - The HTMLElement to assign properties to
 * @param {SeidrElementProps<K>} props - The properties to assign
 */
export const assignProps = <
  K extends keyof HTMLElementTagNameMap,
  E extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
>(
  el: E,
  props: SeidrElementProps<K>,
) => Object.entries(props).forEach(([prop, value]) => assignProp(el, prop as any, value));
