import { getComponentScope } from "../component/lifecycle/component-scope.js";
import { appendChild } from "../dom/append-child.js";
import { getDocument } from "../dom/get-document.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import type { HydrationMismatchNode } from "../ssr/hydrate/types.js";
import { isServer } from "../util/environment/is-server.js";
import { isArray, isNullish, isObj, isStr } from "../util/type-guards.js";
import { assignProps } from "./assign-props.js";
import { isValidSeidrChild } from "./type-guards.js";
import type { SeidrChild, SeidrElementProps } from "./types.js";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrChild | SeidrChild[]} [children] - Child elements when omitting props
 * @returns {HTMLElementTagNameMap[K]} A Seidr-enhanced HTML element
 */
export function $<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K];
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
export function $<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: SeidrElementProps<K> | null,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K];

export function $<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  propsOrChildren?: SeidrElementProps<K> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] {
  let props: SeidrElementProps<K> | null | undefined;
  let resolvedChildren: SeidrChild | SeidrChild[] | undefined;

  if (!isNullish(children)) {
    props = propsOrChildren as SeidrElementProps<K> | null;
    resolvedChildren = children;
  } else if (!isValidSeidrChild(propsOrChildren)) {
    props = propsOrChildren as SeidrElementProps<K>;
    resolvedChildren = undefined;
  } else {
    props = undefined;
    resolvedChildren = propsOrChildren as SeidrChild | SeidrChild[] | undefined;
  }

  /**
   * Apply properties and children to an element.
   *
   * @param {HTMLElementTagNameMap[K]} el - The element to decorate
   * @returns {HTMLElementTagNameMap[K]} The decorated element
   */
  const decorateElement = (el: HTMLElementTagNameMap[K]): HTMLElementTagNameMap[K] => {
    if (isServer()) {
      const scope = getComponentScope();
      scope?.trackChild?.(el);
    }

    if (isObj(props)) {
      assignProps(el, props);
    }

    if (isArray(resolvedChildren)) {
      resolvedChildren.forEach((child) => {
        if (isStr(child) && child === "") {
          return;
        }
        appendChild(el, child);
      });
    } else if (!isNullish(resolvedChildren)) {
      if (!(isStr(resolvedChildren) && resolvedChildren === "")) {
        appendChild(el, resolvedChildren);
      }
    }

    return el;
  };

  // Core bundle and SSR create elements directly
  if (process.env.SEIDR_DISABLE_SSR || isServer()) {
    return decorateElement(getDocument().createElement(tagName));
  }

  // Hydration
  let element: HTMLElementTagNameMap[K];

  const hydrationContext = getHydrationContext();
  if (isHydrating() && hydrationContext) {
    if (hydrationContext.isMismatched()) {
      console.warn(`[Hydration] Mismatched element found: ${tagName}`);
      element = getDocument().createElement(tagName);
    } else {
      element = hydrationContext.claim(tagName) as HTMLElementTagNameMap[K];
    }

    if (!element || (element as HydrationMismatchNode).isHydrationMismatch) {
      const oldNode = element;
      element = getDocument().createElement(tagName);
      if (oldNode?.parentNode) {
        console.warn(`[Hydration] Replacing mismatched element ${oldNode.nodeName} with ${element.tagName}.`);
        oldNode.parentNode.replaceChild(element, oldNode);
      }
    }

    return decorateElement(element);
  }

  // Client side
  return decorateElement(getDocument().createElement(tagName));
}
