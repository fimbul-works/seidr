import { isComponent } from "../../util/type-guards/component-types";
import { isArray } from "../../util/type-guards/primitive-types";
import type { Component } from "../types";

/**
 * Gets the last physical DOM node of a component.
 * Recursively follows components if they don't have markers.
 *
 * @param {Component} comp - The component to get the last node for
 * @returns {Node} The last DOM node
 */
export const getLastNode = (comp: Component): Node => {
  if (comp.endMarker) {
    return comp.endMarker;
  }

  const el = comp.element;
  if (isArray(el)) {
    const last = el[el.length - 1];
    if (isComponent(last)) {
      return getLastNode(last);
    }
    return last as Node;
  }

  if (isComponent(el)) {
    return getLastNode(el);
  }

  return el as Node;
};
