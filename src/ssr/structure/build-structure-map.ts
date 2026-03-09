import type { Component } from "../../component/types";
import { TAG_COMMENT, TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";
import type { StructureMapTuple } from "./types";

/**
 * Converts a component's execution sequence of DOM nodes into the Seidr Structure Map.
 */
export function buildStructureMap(component: Component): StructureMapTuple[] {
  const nodeCreateIndex = component.nodes;
  if (!nodeCreateIndex || nodeCreateIndex.length === 0) {
    return [];
  }

  // 1. Map Node to CreationIndex for O(1) child lookups
  const indexMap = new Map<Node, number>();
  for (let i = 0; i < nodeCreateIndex.length; i++) {
    indexMap.set(nodeCreateIndex[i], i);
  }

  // 2. Build the output array
  const structureMap: StructureMapTuple[] = new Array(nodeCreateIndex.length);

  for (let i = 0; i < nodeCreateIndex.length; i++) {
    const node = nodeCreateIndex[i];

    // Check if it's a child component boundary using explicit map
    const boundaryId = component.childComponentNodes.get(node);
    if (boundaryId) {
      structureMap[i] = [`${TAG_COMPONET_PREFIX}${boundaryId}`];
      continue;
    }

    // It's part of the component, resolve standard info
    let tagName: string;
    if (isHTMLElement(node)) {
      tagName = node.tagName.toLowerCase();
    } else if (isTextNode(node)) {
      tagName = TAG_TEXT;
    } else if (isComment(node)) {
      const text = node.nodeValue?.replace(/^\//, "");
      if (text && component.id.indexOf(text) !== -1) {
        tagName = `${TAG_COMMENT}:${node.nodeValue}`;
      } else {
        tagName = TAG_COMMENT;
      }
    } else {
      tagName = "#unknown";
    }

    const tuple: StructureMapTuple = [tagName];

    // Find children that are in our index map
    for (let j = 0; j < node.childNodes.length; j++) {
      const child = node.childNodes[j] as Node;
      const childIndex = indexMap.get(child);

      if (childIndex !== undefined) {
        tuple.push(childIndex);
      }
    }

    structureMap[i] = tuple;
  }

  return structureMap;
}
