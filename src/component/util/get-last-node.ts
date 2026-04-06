import { isComponent } from "../../util/type-guards/component-types.js";
import { isArray } from "../../util/type-guards/primitive-types.js";
import type { Component } from "../types.js";

/**
 * Gets the last physical DOM node of a component.
 * Recursively follows components if they don't have markers.
 *
 * @param {Component} comp - The component to get the last node for
 * @returns {ChildNode} The last DOM node
 */
export const getLastNode = (comp: Component): ChildNode => {
  if (comp.endMarker) {
    return comp.endMarker;
  }

  const el = comp.element;
  if (isArray(el)) {
    const last = el[el.length - 1];
    if (isComponent(last)) {
      return getLastNode(last);
    }
    return last as ChildNode;
  }

  if (isComponent(el)) {
    return getLastNode(el);
  }

  return el as ChildNode;
};
