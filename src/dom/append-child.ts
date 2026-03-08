import { pop, push } from "../component/component-stack";
import { useScope } from "../component/use-scope";
import type { SeidrChild } from "../element/types";
import { getHydrationContext } from "../ssr/hydrate/hydration-context";
import { getHydrationMap, isHydrating } from "../ssr/hydrate/storage";
import { isServer } from "../util/environment/is-server";
import { isComponent } from "../util/type-guards/component-types";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray, isEmpty } from "../util/type-guards/primitive-types";
import { $text } from "./node/text";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: Node, child: SeidrChild | SeidrChild[] | null | undefined) => {
  // Skip empty children
  if (isEmpty(child) || child === "") {
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

    if (!process.env.CORE_DISABLE_SSR && isServer()) {
      push(child);
      appendChild(parent, child.element);
      pop();
    } else {
      appendChild(parent, child.element);
    }

    if (child.endMarker) {
      appendChild(parent, child.endMarker);
    }

    if (!process.env.CORE_DISABLE_SSR && !isServer() && isHydrating()) {
      const ctx = getHydrationContext();
      if (ctx) {
        ctx.claimBoundary(child.id);
      }
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

  if (typeof child === "string" && !child.trim()) {
    return; // Do not append pure whitespace nodes
  }

  const childNode = isDOMNode(child) ? child : $text(child);

  if (isHydrating() && !process.env.CORE_DISABLE_SSR) {
    const mapped = getHydrationMap().get(childNode);
    if (mapped?.parentNode === target) {
      return;
    }
  }

  // Final safety check to avoid HierarchyRequestError if childNode is already a parent of target.
  const canContain = childNode.nodeType === 1 || childNode.nodeType === 9;
  if (childNode !== target && (!canContain || !childNode.contains(target))) {
    target.appendChild(childNode);
  }
};
