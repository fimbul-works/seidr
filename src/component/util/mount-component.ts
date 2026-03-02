import type { Component, ComponentChildren } from "../../component/types";
import { hydrationMap } from "../../ssr/hydrate/node-map";
import { SeidrError } from "../../types";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";
import { isComponent } from "../../util/type-guards/seidr-dom-types";

/**
 * Mounts a component into the DOM.
 * @param {Component} component The component to mount
 * @param {Node | null} [anchor] The node to insert the component before
 * @param {Node} [parent] Optional parent to mount into if anchor is null or not in DOM
 */
export const mountComponent = (component: Component, anchor?: Node | null, parent?: Node): void => {
  const realAnchor = anchor ? (!process.env.CORE_DISABLE_SSR && hydrationMap.get(anchor)) || anchor : null;
  let realParent = parent ? (!process.env.CORE_DISABLE_SSR && hydrationMap.get(parent)) || parent : null;

  if (realAnchor) {
    if (realParent && realAnchor.parentNode !== realParent) {
      throw new SeidrError(`[mountComponent] Anchor node is not a child of the provided parent.`);
    }
    realParent = realAnchor.parentNode;
  }

  if (realParent) {
    const { startMarker: startNode, endMarker: endNode, element: el } = component;

    const mountChildNode = (node: Node) => {
      if (realAnchor) {
        realParent!.insertBefore(node, realAnchor);
      } else {
        realParent!.appendChild(node);
      }
    };

    if (startNode) {
      mountChildNode(startNode);
    }

    const mountChild = (item: ComponentChildren) => {
      if (isDOMNode(item)) {
        mountChildNode(item);
      } else if (isComponent(item)) {
        mountComponent(item, realAnchor, realParent!);
      }
    };

    if (isArray(el)) {
      el.forEach(mountChild);
    } else {
      mountChild(el);
    }

    if (endNode) {
      mountChildNode(endNode);
    }

    if (!component.parentNode) {
      component.attached(realParent);
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[mountComponent] No parent found to mount component into", { component, anchor, parent });
  }
};
