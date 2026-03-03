import { useScope } from "../component/use-scope";
import type { SeidrChild } from "../element/types";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import { getHydrationContext } from "../ssr/hydrate/hydration-context";
import { hydrationMap } from "../ssr/hydrate/node-map";
import { isDOMNode } from "../util/type-guards/dom-node-types";
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

  if (process.env.NODE_ENV !== "production" && hasHydrationData()) {
    console.log(
      `[Hydration-Append] Appending to <${(parent as any).tagName || parent.nodeName}>:`,
      isComponent(child) ? `Component ${child.id}` : (child as any).tagName || (child as any).nodeName,
    );
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
        target.replaceChild(childNode, staleNode);
        hydrationMap.set(childNode, childNode);
        return;
      }
    }
  }

  // Final safety check to avoid HierarchyRequestError if childNode is already a parent of target.
  // Note: Only Elements/Documents support .contains() on other nodes reliably in JSDOM.
  const canContain = childNode.nodeType === 1 || childNode.nodeType === 9;
  if (childNode !== target && (!canContain || !childNode.contains(target))) {
    if (process.env.NODE_ENV !== "production" && hasHydrationData()) {
      console.log(
        `[Hydration-Append] Actually calling target.appendChild for <${(childNode as any).tagName || childNode.nodeName}>`,
      );
    }
    target.appendChild(childNode);
  }
};
