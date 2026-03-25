import { getCurrentComponent } from "../component/component-stack/get-current-component";
import { appendChild } from "../dom/append-child";
import { getDocument } from "../dom/get-document";
import { getHydrationContext } from "../ssr/hydrate/context/hydration-context";
import type { HydrationMismatchNode } from "../ssr/hydrate/context/types";
import { isHydrating } from "../ssr/hydrate/storage";
import { isServer } from "../util/environment/is-server";
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
  const comp = getCurrentComponent();

  /**
   * Apply properties and children to an element.
   *
   * @param {HTMLElementTagNameMap[K]} el - The element to decorate
   * @returns {HTMLElementTagNameMap[K]} The decorated element
   */
  const decorateElement = (el: HTMLElementTagNameMap[K]): HTMLElementTagNameMap[K] => {
    if (isServer()) {
      comp?.trackChild?.(el);
    }

    if (props) {
      assignProps(el, props);
    }

    if (isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string" && child === "") {
          return;
        }
        appendChild(el, child);
      });
    } else if (!isEmpty(children)) {
      if (!(typeof children === "string" && children === "")) {
        appendChild(el, children);
      }
    }

    return el;
  };

  // Non-SSR or server side
  if (process.env.CORE_DISABLE_SSR || isServer()) {
    return decorateElement(getDocument().createElement(tagName));
  }

  // Hydration
  let element: HTMLElementTagNameMap[K];

  const hydrationContext = getHydrationContext();
  if (!isServer() && isHydrating() && hydrationContext) {
    if (hydrationContext.isMismatched()) {
      element = getDocument().createElement(tagName);
      console.warn("[HYDRATE] Mismatched element found", element.tagName);
    } else {
      element = hydrationContext.claim(tagName) as HTMLElementTagNameMap[K];
    }

    if (!element || (element as HydrationMismatchNode).isHydrationMismatch) {
      const oldNode = element;
      element = getDocument().createElement(tagName);
      if (oldNode?.parentNode) {
        console.warn("[HYDRATE] Replacing mismatched element", oldNode.tagName, "with", element.tagName);
        oldNode.parentNode.replaceChild(element, oldNode);
      }
    }

    return decorateElement(element);
  }

  // Client sides
  return decorateElement(getDocument().createElement(tagName));
};
