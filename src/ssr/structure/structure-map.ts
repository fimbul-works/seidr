import type { Component } from "../../component/types";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";
import { getComponentBoundaryId } from "./boundary";

export type StructureMapTuple = [string, ...number[]];

/**
 * Converts a component's execution sequence of DOM nodes into the Seidr Structure Map.
 */
export function buildStructureMap(component: Component): StructureMapTuple[] {
  const nodeCreateIndex = component.indexedNodes;
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

    // Check if it's a child component boundary
    const boundaryId = getComponentBoundaryId(node, component.id);
    if (boundaryId) {
      structureMap[i] = [`#component:${boundaryId}`];
      continue;
    }

    // It's part of the component, resolve standard info
    let tagName: string;
    if (isHTMLElement(node)) {
      tagName = (node as Element).tagName.toLowerCase();
    } else if (isTextNode(node)) {
      tagName = "#text";
    } else if (isComment(node)) {
      tagName = "#comment";
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

export interface StructureTreeNode {
  _idx: number;
  tag: string;
  children?: StructureTreeNode[];
}

// Clean up empty children arrays for cleaner console output
const removeEmptyChildren = (node: StructureTreeNode) => {
  if (node.children && node.children.length === 0) {
    delete node.children;
  } else if (node.children) {
    node.children.forEach(removeEmptyChildren);
  }
};

/**
 * Utility for parsing a structure map back into a dummy tree for debugging.
 * Only included in SSR builds.
 */
export function renderStructureMapToTree(structureMap: StructureMapTuple[]): StructureTreeNode[] {
  if (!structureMap || structureMap.length === 0) return [];

  // 1. Create all node objects
  const nodes: StructureTreeNode[] = structureMap.map((tuple, index) => {
    return {
      _idx: index,
      tag: tuple[0],
      children: [] as StructureTreeNode[],
    };
  });

  // Track which nodes are children so we can determine roots
  const isChild = new Set<number>();

  // 2. Link children
  structureMap.forEach((tuple, index) => {
    const parent = nodes[index];
    // Skip component boundaries as they don't have children in the parent's map
    if (tuple[0].startsWith("#component:")) return;

    for (let i = 1; i < tuple.length; i++) {
      const childIdx = tuple[i] as number;
      if (nodes[childIdx]) {
        parent.children!.push(nodes[childIdx]);
        isChild.add(childIdx);
      }
    }
  });

  // 3. Find roots
  const roots = nodes.filter((_, idx) => !isChild.has(idx));

  roots.forEach(removeEmptyChildren);

  return roots;
}

/**
 * Converts a structure tree back into a structure map.
 * Useful for verifying the logic and for some debugging scenarios.
 */
export function treeToStructureMap(roots: StructureTreeNode[]): StructureMapTuple[] {
  const allNodes: StructureTreeNode[] = [];

  const collect = (node: StructureTreeNode) => {
    allNodes.push(node);
    node.children?.forEach(collect);
  };
  roots.forEach(collect);

  // Sort by index to rebuild the original sequence
  allNodes.sort((a, b) => a._idx - b._idx);

  const structureMap: StructureMapTuple[] = new Array(allNodes.length);

  allNodes.forEach((node) => {
    const tuple: StructureMapTuple = [node.tag];
    node.children?.forEach((child) => tuple.push(child._idx));
    structureMap[node._idx] = tuple;
  });

  return structureMap;
}
