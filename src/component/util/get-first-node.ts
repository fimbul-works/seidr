import { isComponent } from "../../util/type-guards/component-types.js";
import { isArray } from "../../util/type-guards/primitive-types.js";
import type { Component } from "../types.js";

/**
 * Gets the first physical DOM node of a component.
 * Recursively follows components if they don't have markers.
 *
 * @param {Component} comp - The component to get the first node for
 * @returns {ChildNode} The first DOM node
 */
export const getFirstNode = (comp: Component): ChildNode => {
  if (comp.startMarker) {
    return comp.startMarker;
  }

  const el = comp.element;

  if (isComponent(el)) {
    return getFirstNode(el);
  }

  if (isArray(el)) {
    const first = el[0];
    return isComponent(first) ? getFirstNode(first) : (first as ChildNode);
  }

  return el as ChildNode;
};
