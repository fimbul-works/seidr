import type { Component } from "../component/types.js";
import { useScope } from "../component/use-scope.js";
import { appendChild } from "../dom/append-child.js";
import { getDocument } from "../dom/get-document.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import type { HydrationMismatchNode } from "../ssr/hydrate/types.js";
import { isServer } from "../util/environment/is-server.js";
import { isArray, isEmpty, isObj, isStr } from "../util/type-guards/primitive-types.js";
import { assignProps } from "./assign-props.js";
import type { SeidrChild, SeidrElementProps } from "./types.js";

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
  /**
   * Apply properties and children to an element.
   *
   * @param {HTMLElementTagNameMap[K]} el - The element to decorate
   * @returns {HTMLElementTagNameMap[K]} The decorated element
   */
  const decorateElement = (el: HTMLElementTagNameMap[K]): HTMLElementTagNameMap[K] => {
    if (isServer()) {
      let scope: Component | null = null;
      try {
        scope = useScope();
        scope?.trackChild(el);
      } catch (error) {
        if (!process.env.VITEST) {
          console.error(error);
        }
      }
    }

    if (isObj(props)) {
      assignProps(el, props);
    }

    if (isArray(children)) {
      children.forEach((child) => {
        if (isStr(child) && child === "") {
          return;
        }
        appendChild(el, child);
      });
    } else if (!isEmpty(children)) {
      if (!(isStr(children) && children === "")) {
        appendChild(el, children);
      }
    }

    return el;
  };

  // Core bundle and SSR create elements directly
  if (process.env.DISABLE_SSR || isServer()) {
    return decorateElement(getDocument().createElement(tagName));
  }

  // Hydration
  let element: HTMLElementTagNameMap[K];

  const hydrationContext = getHydrationContext();
  if (hydrationContext) {
    if (hydrationContext.isMismatched()) {
      console.warn(`[Hydration] Mismatched element found ${tagName}.`);
      element = getDocument().createElement(tagName);
    } else {
      element = hydrationContext.claim(tagName) as HTMLElementTagNameMap[K];
    }

    if (!element || (element as HydrationMismatchNode).isHydrationMismatch) {
      const oldNode = element;
      element = getDocument().createElement(tagName);
      if (oldNode?.parentNode) {
        console.warn(`[Hydration] Replacing mismatched element ${oldNode.tagName} with ${element.tagName}.`);
        oldNode.parentNode.replaceChild(element, oldNode);
      }
    }

    return decorateElement(element);
  }

  // Client sides
  return decorateElement(getDocument().createElement(tagName));
};
