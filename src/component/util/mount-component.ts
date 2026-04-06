import type { Component, ComponentChildren } from "../../component/types";
import { isHydrating } from "../../ssr/hydrate";
import { SeidrError } from "../../types";
import { isServer } from "../../util/environment";
import { isComponent } from "../../util/type-guards/component-types";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";

/**
 * Mounts a component into the DOM.
 * @param {Component} component The component to mount
 * @param {Node | null} [anchor] The node to insert the component before
 * @param {Node | null} [parent] Optional parent to mount into if anchor is null or not in DOM
 */
export const mountComponent = (component: Component, anchor?: Node | null, parent?: Node | null): void => {
  const realAnchor = anchor;
  let realParent = parent;

  if (realAnchor) {
    if (realParent && realAnchor.parentNode !== realParent) {
      throw new SeidrError(`[mountComponent] Anchor node is not a child of the provided parent.`);
    }
    realParent = realAnchor.parentNode;
  }

  if (realParent) {
    if (!process.env.DISABLE_SSR && isHydrating()) {
      // If any part is already in DOM, assume it's hydrated
      const marker = component.startMarker || (isArray(component.element) ? component.element[0] : component.element);
      if (marker && isDOMNode(marker) && marker.parentNode === realParent) {
        if (!component.isMounted) {
          component.mount(realParent);
        }
        return;
      }
    }

    const { startMarker: startNode, endMarker: endNode, element: el } = component;

    const mountChildNode = (node: Node) => {
      const target = realParent!;
      if (realAnchor) {
        target.insertBefore(node, realAnchor);
      } else {
        target.appendChild(node);
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

    if (!component.isMounted) {
      component.mount(realParent);
    }
  }
};
