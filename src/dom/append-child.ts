import { useScope } from "../component/use-scope";
import type { SeidrChild } from "../element/types";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import { getHydrationContext } from "../ssr/hydrate/hydration-context";
import { hydrationMap } from "../ssr/hydrate/node-map";
import { isDOMNode, isHTMLElement, isTextNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";
import { isComponent } from "../util/type-guards/seidr-dom-types";
import { $text } from "./node/text";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: Node, child: SeidrChild | SeidrChild[] | null | undefined) => {
  // Skip empty children
  if (!child) {
    return;
  }

  // Append array of nodes
  if (isArray(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

  // Append Seidr component
  if (isComponent(child)) {
    if (child.startMarker) {
      appendChild(parent, child.startMarker);
    }

    appendChild(parent, child.element);

    if (child.endMarker) {
      appendChild(parent, child.endMarker);
    }

    if (!child.parentNode) {
      child.attached(parent);
    }

    try {
      const scope = useScope();
      scope.child(child);
    } catch (_e) {
      // Ignore if not in a component context
    }
    return;
  }

  const target = parent as ParentNode;
  const childNode = isDOMNode(child) ? child : $text(child);

  if (hasHydrationData() && !process.env.CORE_DISABLE_SSR) {
    // If we're hydrating, the node might already be in the DOM.
    // Check if we have a mapping for this virtual node to a real SSR node
    const mapped = hydrationMap.get(childNode);
    if (mapped && mapped.parentNode === target) {
      return;
    }

    // RECONCILIATION: If we are here, we have a new/unmapped node during hydration.
    const hCtx = getHydrationContext();
    if (hCtx && !mapped) {
      const staleNode = hCtx.lastAttemptedNode;

      if (staleNode && staleNode.parentNode === target) {
        if (process.env.NODE_ENV !== "production") {
          const tag = isHTMLElement(childNode)
            ? (childNode as HTMLElement).tagName.toLowerCase()
            : childNode.nodeName.toLowerCase();
          const staleTag = isHTMLElement(staleNode)
            ? (staleNode as HTMLElement).tagName.toLowerCase()
            : staleNode.nodeName.toLowerCase();
          console.warn(
            `[Hydration mismatch] Replacing stale <${staleTag}> with new <${tag}> in <${(target as any).tagName || target.nodeName}>`,
          );
        }
        target.replaceChild(childNode, staleNode);
        hydrationMap.set(childNode, childNode);
        return;
      }
    }

    if (process.env.NODE_ENV === "development") {
      const tag = isHTMLElement(childNode)
        ? (childNode as HTMLElement).tagName.toLowerCase()
        : isTextNode(childNode)
          ? "#text"
          : "unknown";
      const parentTag = isHTMLElement(target) ? (target as HTMLElement).tagName : "Node";
      console.warn(
        `[Hydration mismatch] Discrepancy detected: appending new <${tag}> to <${parentTag}> as it was missing from SSR.`,
        { childNode, target },
      );
    }
  }

  // Final safety check to avoid HierarchyRequestError if childNode is already a parent of target.
  // Note: Only Elements/Documents support .contains() on other nodes reliably in JSDOM.
  const canContain = childNode.nodeType === 1 || childNode.nodeType === 9;
  if (childNode !== target && (!canContain || !childNode.contains(target))) {
    target.appendChild(childNode);
  }
};
