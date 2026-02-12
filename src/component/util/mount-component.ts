import type { SeidrComponent, SeidrComponentChildren } from "../../component/types";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";
import { isSeidrComponent } from "../../util/type-guards/seidr-dom-types";

/**
 * Mounts a component into the DOM.
 * @param {SeidrComponent} component The component to mount
 * @param {Node} anchor The node to insert the component before
 */
export const mountComponent = (component: SeidrComponent, anchor: Node): void => {
  const parent = anchor.parentNode;
  if (parent) {
    const { startMarker: startNode, endMarker: endNode, element: el } = component;

    parent.insertBefore(startNode, anchor);

    const mountChild = (item: SeidrComponentChildren) => {
      if (isDOMNode(item)) {
        parent.insertBefore(item, anchor);
      } else if (isSeidrComponent(item)) {
        mountComponent(item, anchor);
      }
    };

    if (isArray(el)) {
      el.forEach(mountChild);
    } else {
      mountChild(el);
    }

    parent.insertBefore(endNode, anchor);

    if (!component.scope.parentNode) {
      component.scope.attached(parent);
    }
  }
};
