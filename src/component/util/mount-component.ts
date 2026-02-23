import type { Component, ComponentChildren } from "../../component/types";
import { hydrationMap } from "../../ssr/hydrate/node-map";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";
import { isComponent } from "../../util/type-guards/seidr-dom-types";

/**
 * Mounts a component into the DOM.
 * @param {Component} component The component to mount
 * @param {Node} anchor The node to insert the component before
 */
export const mountComponent = (component: Component, anchor: Node): void => {
  const realAnchor = (!process.env.CORE_DISABLE_SSR && hydrationMap.get(anchor)) || anchor;
  const parent = realAnchor.parentNode;
  if (parent) {
    const { startMarker: startNode, endMarker: endNode, element: el } = component;

    if (startNode) {
      parent.insertBefore(startNode, realAnchor);
    }

    const mountChild = (item: ComponentChildren) => {
      if (isDOMNode(item)) {
        parent.insertBefore(item, realAnchor);
      } else if (isComponent(item)) {
        mountComponent(item, realAnchor);
      }
    };

    if (isArray(el)) {
      el.forEach(mountChild);
    } else {
      mountChild(el);
    }

    if (endNode) {
      parent.insertBefore(endNode, realAnchor);
    }

    if (!component.parentNode) {
      component.attached(parent);
    }
  }
};
