import { appendChild } from "../dom/append-child";
import { getDOMFactory } from "../dom/dom-factory";
import type { CleanupFunction } from "../types";
import { isArray } from "../util/type-guards";
import { assignProps } from "./assign-props";
import { decorateElement } from "./decorate-element";
import type { SeidrChild, SeidrElement, SeidrElementProps } from "./types";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrElementProps<K>} [props] - Element properties supporting reactive bindings
 * @param {SeidrChild[]} [children] - Child elements
 * @returns {SeidrElement<K>} A Seidr-enhanced HTML element
 */
export const $ = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: SeidrElementProps<K>,
  children?: SeidrChild[],
): SeidrElement<K> => {
  const cleanups: CleanupFunction[] = [];
  const domFactory = getDOMFactory();
  const el = decorateElement<K>(domFactory.createElement(tagName), cleanups);

  if (props) {
    assignProps(el as HTMLElement, props, cleanups);
  }

  if (isArray(children)) {
    children.forEach((child) => appendChild(el, child, cleanups));
  } else if (children != null) {
    appendChild(el, children, cleanups);
  }

  return el;
};
