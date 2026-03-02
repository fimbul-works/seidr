import { isArray } from "../../util/type-guards/primitive-types";
import { isComponent } from "../../util/type-guards/seidr-dom-types";
import type { Component } from "../types";

/**
 * Gets the first physical DOM node of a component.
 * Recursively follows components if they don't have markers.
 *
 * @param {Component} comp - The component to get the first node for
 * @returns {Node} The first DOM node
 */
export const getFirstNode = (comp: Component): Node => {
  if (comp.startMarker) {
    return comp.startMarker;
  }

  const el = comp.element;
  if (isArray(el)) {
    return el[0] as Node;
  }

  if (isComponent(el)) {
    return getFirstNode(el);
  }

  return el as Node;
};

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
    return el[el.length - 1] as Node;
  }

  if (isComponent(el)) {
    return getLastNode(el);
  }

  return el as Node;
};

// Re-export old names for compatibility during migration if needed,
// but we'll try to update all callers now.
export const getComponentFirstNode = getFirstNode;
export const getComponentLastNode = getLastNode;
