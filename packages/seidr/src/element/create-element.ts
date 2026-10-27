import { isArr, isStr } from "@fimbul-works/hvat";
import { getComponentScope } from "../component/component-scope.js";
import { appendChild } from "../dom/append-child.js";
import { getDocument } from "../dom/get-document.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import type { HydrationMismatchNode } from "../ssr/hydrate/types.js";
import { isServer } from "../util/environment/is-server.js";
import { resolvePropsAndChildren } from "../util/resolve-props-and-children.js";
import { assignProps } from "./assign-props.js";
import type { SeidrChild, SeidrElementProps, SeidrElementTagNameMap } from "./types.js";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrChild | SeidrChild[]} [children] - Child elements when omitting props
 * @returns {SeidrElementTagNameMap[K]} A Seidr-enhanced HTML element
 */
export function $<K extends keyof SeidrElementTagNameMap>(
  tagName: K,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[K];
/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrElementProps<K> | null} [props] - Element properties supporting reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Child elements
 * @returns {SeidrElementTagNameMap[K]} A Seidr-enhanced HTML element
 */
export function $<K extends keyof SeidrElementTagNameMap>(
  tagName: K,
  props?: SeidrElementProps<K> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[K];

export function $<K extends keyof SeidrElementTagNameMap>(
  tagName: K,
  propsOrChildren?: SeidrElementProps<K> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[K] {
  const doc = getDocument();

  const [props, resolvedChildren] = resolvePropsAndChildren<SeidrElementProps<K>>(propsOrChildren, children);

  /**
   * Apply properties and children to an element.
   */
  const decorateElement = (el: SeidrElementTagNameMap[K]): SeidrElementTagNameMap[K] => {
    if (isServer()) {
      const scope = getComponentScope();
      scope?.trackChild?.(el);
    }

    assignProps(el, props);

    if (isArr(resolvedChildren)) {
      resolvedChildren.forEach((child) => {
        if (isStr(child) && child === "") {
          return;
        }
        appendChild(el, child);
      });
    } else if (!(isStr(resolvedChildren) && resolvedChildren === "")) {
      appendChild(el, resolvedChildren);
    }

    return el;
  };

  // Create elements directly when hydration is not an issue
  if (process.env.SEIDR_DISABLE_SSR || isServer()) {
    return decorateElement(doc.createElement(tagName) as SeidrElementTagNameMap[K]);
  }

  // Handle hydration
  const hydrationContext = getHydrationContext();
  if (isHydrating() && hydrationContext) {
    let element: SeidrElementTagNameMap[K];

    if (hydrationContext.isMismatched()) {
      console.warn(`[seidr:hydration] Mismatched element found: ${tagName}`);
      element = doc.createElement(tagName) as SeidrElementTagNameMap[K];
    } else {
      element = hydrationContext.claim<SeidrElementTagNameMap[K]>(tagName);
    }

    if (!element || (element as unknown as HydrationMismatchNode).isHydrationMismatch) {
      const oldNode = element;
      element = doc.createElement(tagName) as SeidrElementTagNameMap[K];
      if (oldNode?.parentNode) {
        console.warn(`[seidr:hydration] Replacing mismatched element ${oldNode.nodeName} with ${element.tagName}.`);
        oldNode.parentNode.replaceChild(element, oldNode);
      }
    }

    return decorateElement(element);
  }

  return decorateElement(doc.createElement(tagName) as SeidrElementTagNameMap[K]);
}
