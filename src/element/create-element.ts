import { appendChild } from "../dom/append-child";
import { getDocument } from "../dom/get-document";
import { getRenderContext } from "../render-context";
import { getFeature } from "../render-context/feature";
import { getHydrationCursorFeature } from "../ssr/hydrate/feature";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import { isArray, isEmpty } from "../util/type-guards";
import { assignProps } from "./assign-props";
import type { SeidrChild, SeidrElementProps } from "./types";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrElementProps<K> | null} [props] - Element properties supporting reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Child elements
 * @returns {HTMLElementTagNameMap[K]} A Seidr-enhanced HTML element
 */
export const $ = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: SeidrElementProps<K> | null,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] => {
  if (process.env.CORE_DISABLE_SSR || !hasHydrationData()) {
    const el = getDocument().createElement(tagName);

    if (props) {
      assignProps(el, props);
    }

    if (isArray(children)) {
      children.forEach((child) => appendChild(el, child));
    } else if (!isEmpty(children)) {
      appendChild(el, children);
    }

    return el;
  }

  const ctx = getRenderContext();
  const cursor = getFeature(getHydrationCursorFeature(), ctx);

  const claimed = cursor?.claimElement(tagName);
  const el = claimed || getDocument().createElement(tagName);

  if (props) {
    assignProps(el, props);
  }

  cursor?.enter(claimed || null);

  if (isArray(children)) {
    children.forEach((child) => appendChild(el, child));
  } else if (!isEmpty(children)) {
    appendChild(el, children);
  }

  cursor?.exit();

  return el;
};
