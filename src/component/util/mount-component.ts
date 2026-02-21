import type { Component, ComponentChildren } from "../../component/types";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";
import { isComponent } from "../../util/type-guards/seidr-dom-types";

/**
 * Mounts a component into the DOM.
 * @param {Component} component The component to mount
 * @param {Node} anchor The node to insert the component before
 */
export const mountComponent = (component: Component, anchor: Node): void => {
  const parent = anchor.parentNode;
  if (parent) {
    const { startMarker: startNode, endMarker: endNode, element: el } = component;

    parent.insertBefore(startNode, anchor);

    const mountChild = (item: ComponentChildren) => {
      if (isDOMNode(item)) {
        parent.insertBefore(item, anchor);
      } else if (isComponent(item)) {
        mountComponent(item, anchor);
      }
    };

    if (isArray(el)) {
      el.forEach(mountChild);
    } else {
      mountChild(el);
    }

    parent.insertBefore(endNode, anchor);

    if (!component.parentNode) {
      component.attached(parent);
    }
  }
};
