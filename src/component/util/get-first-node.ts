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
  if (isArray(el)) {
    const first = el[0];
    if (isComponent(first)) {
      return getFirstNode(first);
    }
    return first as ChildNode;
  }

  if (isComponent(el)) {
    const res = getFirstNode(el);
    if (!res) {
      console.error(`[getFirstNode] Warning: component ${el.id} returned no first node`);
    }
    return res;
  }

  return el as ChildNode;
};
