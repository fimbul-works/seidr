import { useScope } from "../component/use-scope";
import type { SeidrChild } from "../element/types";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import { consumeHydrationNode } from "../ssr/hydrate/hydrate-tree";
import { type HydrationTarget, isHydrationTarget } from "../ssr/hydrate/node-map";
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

  const target = (parent as HTMLTemplateElement).content || parent;
  const childNode = isDOMNode(child) ? child : $text(child);

  if (hasHydrationData() && !process.env.CORE_DISABLE_SSR) {
    if (isHydrationTarget(target as Node) && consumeHydrationNode(target as HydrationTarget, childNode)) {
      return;
    }
  }

  target.appendChild(childNode);
};
