import { useScope } from "../component/use-scope";
import type { SeidrChild } from "../element/types";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import { getHydrationContext } from "../ssr/hydrate/hydration-context";
import { replaceWithStateTransfer } from "../ssr/hydrate/mismatch-fallback";
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
      scope.onUnmount(child.unmount);
    } catch (_e) {
      // Ignore if not in a component context
    }
    return;
  }

  const target = parent as ParentNode;
  const childNode = isDOMNode(child) ? child : $text(child);

  if (hasHydrationData() && !process.env.CORE_DISABLE_SSR) {
    // If we're hydrating, the node might already be in the DOM.
    // If it is, and it's already a child of this parent, we skip.
    if (childNode.parentNode === target) {
      return;
    }

    // Check if we have a mapping for this virtual node to a real SSR node
    const mapped = hydrationMap.get(childNode);
    if (mapped && mapped.parentNode === target) {
      return;
    }

    // RECONCILIATION: If we are here, we have a new/unmapped node during hydration.
    // We check if the last node we tried to match at this sequence point was a stale candidate.
    const hCtx = getHydrationContext();
    if (hCtx && !mapped) {
      const staleNode = hCtx.lastAttemptedNode;
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[Hydration-Reconcile] Trying to replace stale ${staleNode?.nodeName} with new ${childNode.nodeName}`,
          {
            staleParent: staleNode?.parentNode?.nodeName,
            target: (target as HTMLElement).tagName || target.nodeName,
            match: staleNode?.parentNode === target,
          },
        );
      }
      if (staleNode && staleNode.parentNode === target) {
        replaceWithStateTransfer(staleNode, childNode);
        // We also mark this new node as the valid physical node for this sequence entry
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
        `[Hydration mismatch] WHAT: Component structure discrepancy detected.\n` +
          `HOW: The client injected an expected child node <${tag}> that the server did not include in the rendered parent <${parentTag}>.\n` +
          `WHERE: Node appending phase inside <${parentTag}>.\n` +
          `WHY: This happens when a client-side side-effect or different initial state causes a component to render additional elements not present during SSR.\n` +
          `ACTION: Injecting new client-rendered <${tag}> as child element.`,
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
