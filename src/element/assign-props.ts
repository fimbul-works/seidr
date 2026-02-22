import { getNextId } from "../render-context/get-next-id";
import { isSeidr } from "../util/type-guards";
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
  if (Object.values(props).some(isSeidr)) {
    el.dataset.seidrId = String(getNextId());
  }
  Object.entries(props).forEach(([prop, value]) => assignProp(el, prop, value));
};
