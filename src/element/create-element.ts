import { getCurrentComponent } from "../component/component-stack";
import { appendChild } from "../dom/append-child";
import { getDocument } from "../dom/get-document";
import { getHydrationContext } from "../ssr/hydrate/hydration-context";
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

  if (!process.env.CORE_DISABLE_SSR && isServer()) {
    const el = getDocument().createElement(tagName);

    if (!process.env.CORE_DISABLE_SSR) {
      comp?.trackNode?.(el);
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

  const hydrationContext = !process.env.CORE_DISABLE_SSR ? getHydrationContext() : null;
  if (hydrationContext) {
    const claimedNode = hydrationContext.claim(tagName) as HTMLElementTagNameMap[K];

    if (claimedNode) {
      // Store the relationship for reactive updates
      getHydrationMap().set(claimedNode, claimedNode);

      if (isHTMLElement(claimedNode)) {
        if (props) {
          assignProps(claimedNode, props);
        }

        if (isArray(children)) {
          children.forEach((child) => {
            if (typeof child === "string" && !child.trim()) return;
            appendChild(claimedNode, child);
          });
        } else if (!isEmpty(children)) {
          if (!(typeof children === "string" && !children.trim())) {
            appendChild(claimedNode, children);
          }
        }
      }

      return claimedNode;
    } else {
      // Structural mismatch: what we found at this index is NOT the expected tagName
      const mismatchNode = hydrationContext.lastAttemptedNode;
      const newNode = getDocument().createElement(tagName);

      if (mismatchNode?.parentNode) {
        console.warn(
          `[Hydration] Tag mismatch: expected <${tagName}> but found <${mismatchNode.nodeName}>. Replacing SSR node.`,
          "node:",
          mismatchNode,
          "in component:",
          hydrationContext.componentId,
        );
        mismatchNode.parentNode.replaceChild(newNode, mismatchNode);
      }

      getHydrationMap().set(newNode, newNode);

      // Procedural render for children of the new node
      if (props) {
        assignProps(newNode, props);
      }
      if (isArray(children)) {
        children.forEach((child) => {
          if (typeof child === "string" && !child.trim()) return;
          appendChild(newNode, child);
        });
      } else if (!isEmpty(children)) {
        if (!(typeof children === "string" && !children.trim())) {
          appendChild(newNode, children);
        }
      }

      return newNode as HTMLElementTagNameMap[K];
    }
  }

  const el = getDocument().createElement(tagName);

  if (props) {
    assignProps(el, props);
  }

  if (isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string" && !child.trim()) return;
      appendChild(el, child);
    });
  } else if (!isEmpty(children)) {
    if (!(typeof children === "string" && !children.trim())) {
      appendChild(el, children);
    }
  }

  return el;
};
