import { assignProp } from "./assign-prop";
import type { SeidrElementProps } from "./types";

/**
 * Assigns properties to an HTMLElement.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @param {HTMLElement} el - The HTMLElement to assign properties to
 * @param {SeidrElementProps<K>} props - The properties to assign
 */
export const assignProps = <K extends keyof HTMLElementTagNameMap>(el: HTMLElement, props: SeidrElementProps<K>) => {
  Object.entries(props).forEach(([prop, value]) => assignProp(el, prop, value));
};
