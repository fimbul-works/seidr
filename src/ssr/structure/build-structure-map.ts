import type { Component } from "../../component/types";
import { collectRootNodes } from "../../component/util/collect-root-nodes";
import { TAG_COMMENT, TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";
import type { StructureMapTuple } from "./types";

/**
 * Builds a structure map for the given component.
 *
 * @param {Component} component - The component to build the structure map for
 * @returns {StructureMapTuple[]} An array of tuples representing the structure of the component
 */
export function buildStructureMap(component: Component): StructureMapTuple[] {
  const isRootNodeOf = (node: Node, comp: Component): boolean => {
    return collectRootNodes(comp).indexOf(node) !== -1;
  };

  const findChildIndexById = (compId: string, parent: Component): number => {
    for (let i = 0; i < parent.nodes.length; i++) {
      if (parent.childComponentNodes.get(parent.nodes[i]) === compId) {
        return i;
      }
    }
    return -1;
  };

  const nodeCreateIndex = component.nodes;
  if (!nodeCreateIndex || nodeCreateIndex.length === 0) return [];

  const indexMap = new Map<Node, number>();
  nodeCreateIndex.forEach((n, i) => indexMap.set(n, i));

  return nodeCreateIndex.map((node) => {
    // 1. Check if boundary
    let boundaryId = component.childComponentNodes.get(node);

    // 2. JIT fallback for shifted/swapped boundaries
    if (!boundaryId) {
      for (const child of component.children.values()) {
        if (isRootNodeOf(node, child)) {
          boundaryId = child.id;
          component.childComponentNodes.set(node, boundaryId);
          break;
        }
      }
    }

    if (boundaryId) {
      return [`${TAG_COMPONET_PREFIX}${boundaryId}`];
    }

    // 3. Normal node resolution
    let tagName: string;
    if (isHTMLElement(node)) {
      tagName = (node as any).lowerTagName || node.tagName.toLowerCase();
    } else if (isTextNode(node)) {
      tagName = TAG_TEXT;
    } else if (isComment(node)) {
      const text = node.nodeValue?.replace(/^\//, "");
      tagName = text && component.id.indexOf(text) !== -1 ? `${TAG_COMMENT}:${node.nodeValue}` : TAG_COMMENT;
    } else {
      tagName = "#unknown";
    }

    const tuple: StructureMapTuple = [tagName];
    for (let j = 0; j < node.childNodes.length; j++) {
      const child = node.childNodes[j] as Node;
      let childIdx = indexMap.get(child);

      // Recursive JIT for child boundaries
      if (childIdx === undefined) {
        for (const childComp of component.children.values()) {
          if (isRootNodeOf(child, childComp)) {
            childIdx = findChildIndexById(childComp.id, component);
            if (childIdx !== -1) {
              component.childComponentNodes.set(child, childComp.id);
              indexMap.set(child, childIdx);
              break;
            }
          }
        }
      }

      if (childIdx !== undefined) tuple.push(childIdx);
    }

    return tuple;
  });
}
