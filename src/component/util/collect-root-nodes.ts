import { isComponent } from "../../util/type-guards";
import type { Component } from "../types";

/**
 * Collects all root physical nodes of a component (handling fragments and pass-throughs).
 * @param {Component} comp - Component to collect root nodes from
 * @returns {Node[]} Array of root DOM nodes
 */
export function collectRootNodes(comp: Component): Node[] {
  if (comp.startMarker && comp.endMarker) {
    const nodes: Node[] = [comp.startMarker];
    let curr = comp.startMarker.nextSibling;
    while (curr && curr !== comp.endMarker) {
      nodes.push(curr);
      curr = curr.nextSibling;
    }
    nodes.push(comp.endMarker);
    return nodes;
  }

  const el = comp.element;
  if (!el) return [];

  const nodes: Node[] = [];
  const walk = (item: any) => {
    if (Array.isArray(item)) {
      item.forEach(walk);
    } else if (isComponent(item)) {
      // 100 is TYPE_COMPONENT
      walk(item.element);
    } else if (item) {
      nodes.push(item);
    }
  };
  walk(el);
  return nodes;
}
