import { SEIDR_CLEANUP, TYPE_PROP } from "../constants";
import { getNextId } from "../render-context/get-next-id";
import { type CleanupFunction, SeidrError } from "../types";
import { isSeidr } from "../util/type-guards";
import { assignProp } from "./assign-prop";
import type { SeidrElementProps } from "./types";

/**
 * Assigns properties to an HTMLElement.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @param {HTMLElement} el - The HTMLElement to assign properties to
 * @param {SeidrElementProps<K>} props - The properties to assign
 * @param {CleanupFunction[]} cleanups - Array to push cleanup functions to
 */
export function assignProps<K extends keyof HTMLElementTagNameMap>(
  el: HTMLElement,
  props: SeidrElementProps<K>,
  cleanups: CleanupFunction[],
) {
  if (Object.values(props).some(isSeidr)) {
    el.dataset.seidrId = String(getNextId());
  }

  for (const [prop, value] of Object.entries(props)) {
    if ([TYPE_PROP, "on", "clear", SEIDR_CLEANUP].includes(prop)) {
      throw new SeidrError(`Unallowed property "${prop}"`);
    }

    assignProp(el, prop, value, cleanups);
  }
}
