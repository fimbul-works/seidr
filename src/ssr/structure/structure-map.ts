import type { Component } from "../../component/types";
import { TAG_COMMENT, TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import { isComment, isHTMLElement, isTextNode } from "../../util/type-guards/dom-node-types";

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

export interface StructureTreeNode {
  _idx: number;
  tag: string;
  id?: string;
  children?: StructureTreeNode[];
}

/**
 * Builds a complete virtual DOM tree from hydration component data.
 *
 * Tuple format: [tag, ...childIndices]
 * - Component entries (#component:X) carry no child indices; their subtree comes from data[X].
 * - Regular node indices reference other tuples in the same component's array.
 * - Orphaned component nodes (not referenced by any parent index) are injected into the first
 *   referenced node that follows them in tuple order — because component boundaries are always
 *   tracked before the DOM element that contains them (creation order).
 */
export function buildDomTree(data: Record<string, StructureMapTuple[]>): StructureTreeNode[] {
  const componentIds = Object.keys(data);
  if (componentIds.length === 0) return [];

  const rootId = componentIds.find((id) => id.endsWith("-1")) || componentIds[0];
  return buildComponentTree(rootId, data);
}

function buildComponentTree(componentId: string, data: Record<string, StructureMapTuple[]>): StructureTreeNode[] {
  const tuples = data[componentId];
  if (!tuples || tuples.length === 0) return [];

  // 1. Collect all indices explicitly referenced as children by non-component nodes
  const childSet = new Set<number>();
  for (const [tag, ...indices] of tuples) {
    if (!tag.startsWith(TAG_COMPONET_PREFIX)) {
      for (const idx of indices) childSet.add(idx);
    }
  }

  // 2. Find orphaned component nodes (component nodes not referenced by any parent).
  //    Their host is the first referenced index that comes after them in tuple order,
  //    reflecting that component boundaries are created before their containing element.
  const sortedChildIndices = [...childSet].sort((a, b) => a - b);
  const hostToOrphans = new Map<number, number[]>();
  const orphansWithHost = new Set<number>();

  for (let i = 0; i < tuples.length; i++) {
    const [tag] = tuples[i];
    if (tag.startsWith(TAG_COMPONET_PREFIX) && !childSet.has(i)) {
      const hostIdx = sortedChildIndices.find((idx) => idx > i);
      if (hostIdx !== undefined) {
        if (!hostToOrphans.has(hostIdx)) hostToOrphans.set(hostIdx, []);
        hostToOrphans.get(hostIdx)!.push(i);
        orphansWithHost.add(i);
      }
      // Orphans with no host (e.g. Switch alternatives) become roots
    }
  }

  // 3. Recursively build a node for a given tuple index
  const buildNode = (idx: number): StructureTreeNode => {
    const [tag, ...indices] = tuples[idx];
    const isComp = tag.startsWith(TAG_COMPONET_PREFIX);
    const id = isComp ? tag.slice(TAG_COMPONET_PREFIX.length) : undefined;

    const node: StructureTreeNode = { _idx: idx, tag, id };

    if (isComp && id) {
      // Component: expand recursively from its own data
      const subtree = buildComponentTree(id, data);
      if (subtree.length > 0) node.children = subtree;
    } else {
      // Regular node: injected orphans first (they precede the host in creation order), then explicit children
      const injected = (hostToOrphans.get(idx) || []).map(buildNode);
      const explicit = indices.map(buildNode);
      const all = [...injected, ...explicit];
      if (all.length > 0) node.children = all;
    }

    return node;
  };

  // 4. Root nodes: not referenced as a child AND not injected into a host
  return tuples
    .map((_, idx) => idx)
    .filter((idx) => !childSet.has(idx) && !orphansWithHost.has(idx))
    .map(buildNode);
}

/**
 * Utility for parsing a single component's structure map into a tree for debugging.
 * Does not expand component boundaries — use buildDomTree for the full recursive tree.
 */
export function renderStructureMapToTree(structureMap: StructureMapTuple[]): StructureTreeNode[] {
  if (!structureMap || structureMap.length === 0) return [];

  // 1. Create all node objects (no children yet)
  const nodes: StructureTreeNode[] = structureMap.map((tuple, index) => ({
    _idx: index,
    tag: tuple[0],
    id: tuple[0].startsWith(TAG_COMPONET_PREFIX) ? tuple[0].slice(TAG_COMPONET_PREFIX.length) : undefined,
  }));

  // Track which nodes are children so we can determine roots
  const isChild = new Set<number>();

  // 2. Link children for non-component nodes
  structureMap.forEach((tuple, index) => {
    const parent = nodes[index];

    // Component boundaries carry no child indices in the parent's map
    if (parent.tag.startsWith(TAG_COMPONET_PREFIX)) {
      return;
    }

    for (let i = 1; i < tuple.length; i++) {
      const childIdx = tuple[i] as number;
      if (nodes[childIdx]) {
        if (!parent.children) parent.children = [];
        parent.children.push(nodes[childIdx]);
        isChild.add(childIdx);
      }
    }
  });

  // 3. Find roots
  return nodes.filter((_, idx) => !isChild.has(idx));
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
