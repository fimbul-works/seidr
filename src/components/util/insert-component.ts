import type { SeidrComponent } from "../../component/types";
import { getMarkerComments } from "../../dom/get-marker-comments";
import { isDOMNode } from "../../util/type-guards/dom-node-types";
import { isArray } from "../../util/type-guards/primitive-types";

/**
 * Inserts a component into the DOM.
 * @param {string} scopeId The ID of the scope.
 * @param {SeidrComponent} component The component to insert.
 */
export const insertComponent = (scopeId: string, component: SeidrComponent): void => {
  const [, endMarker] = getMarkerComments(scopeId);

  // Get the parent node
  const parent = endMarker.parentNode;
  if (!parent) {
    return;
  }

  // Insert elements
  parent.insertBefore(component.startMarker, endMarker);

  const el = component.element;
  if (isArray(el)) {
    el.forEach((node) => isDOMNode(node) && parent.insertBefore(node, endMarker));
  } else if (isDOMNode(el)) {
    parent.insertBefore(el, endMarker);
  }

  parent.insertBefore(component.endMarker, endMarker);

  // Invoke onAttached callback
  component.scope.attached(parent);
};
