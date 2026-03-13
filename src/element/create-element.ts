import { getCurrentComponent } from "../component/component-stack";
import { appendChild } from "../dom/append-child";
import { getDocument } from "../dom/get-document";
import { getHydrationContext } from "../ssr/hydrate/context/hydration-context";
import { getHydrationMap } from "../ssr/hydrate/storage";
import { isServer } from "../util/environment/is-server";
import { isArray, isEmpty, isHTMLElement } from "../util/type-guards";
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

  if (process.env.CORE_DISABLE_SSR || isServer()) {
    const el = getDocument().createElement(tagName);

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
  }

  let element: HTMLElementTagNameMap[K];
  const hydrationContext = getHydrationContext();
  if (hydrationContext) {
    element = hydrationContext.claim(tagName) as HTMLElementTagNameMap[K];

    if (isHTMLElement(element)) {
      // Store the relationship for reactive updates
      getHydrationMap().set(element, element);
    } else {
      // Structural mismatch: what we found at this index is NOT the expected tagName
      element = getDocument().createElement(tagName);
      getHydrationMap().set(element, element);
    }

    // Procedural render for children of the new node
    if (props) {
      assignProps(element, props);
    }
    if (isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string" && child === "") return;
        appendChild(element, child);
      });
    } else if (!isEmpty(children)) {
      if (!(typeof children === "string" && children === "")) {
        appendChild(element, children);
      }
    }

    return element as HTMLElementTagNameMap[K];
  }

  const el = getDocument().createElement(tagName);

  if (props) {
    assignProps(el, props);
  }

  if (isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string" && child === "") return;
      appendChild(el, child);
    });
  } else if (!isEmpty(children)) {
    if (!(typeof children === "string" && children === "")) {
      appendChild(el, children);
    }
  }

  return el;
};
