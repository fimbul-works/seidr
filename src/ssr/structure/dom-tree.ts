import { TAG_COMPONET_PREFIX } from "../../constants";
import type { StructureMapTuple } from "./structure-map";

export interface StructureTreeNode {
  _idx: number;
  tag: string;
  id?: string;
  children?: StructureTreeNode[];
}

/**
 * Builds a complete virtual DOM tree from hydration component data.
 */
export function buildDomTree(data: Record<string, StructureMapTuple[]>): StructureTreeNode[] {
  const componentIds = Object.keys(data);
  if (componentIds.length === 0) return [];

  // Root is usually the first component registered (e.g. App-1)
  const rootId = componentIds[0];
  return buildComponentTree(rootId, data);
}

function buildComponentTree(componentId: string, data: Record<string, StructureMapTuple[]>): StructureTreeNode[] {
  const tuples = data[componentId];
  if (!tuples || !Array.isArray(tuples)) {
    if (tuples) {
      console.error(`[dom-tree] Warning: Component data for ${componentId} is not an array:`, typeof tuples);
    }
    return [];
  }
  if (tuples.length === 0) return [];

  // 1. Identify all nodes that are referenced as children
  const referencedAsChild = new Set<number>();
  for (const tuple of tuples) {
    if (!tuple || !Array.isArray(tuple)) continue;
    const [tag, ...indices] = tuple;
    // Note: Component boundaries themselves (#component:X) don't list their indices in the tuple,
    // their structure is defined in data[X].
    if (!tag.startsWith(TAG_COMPONET_PREFIX)) {
      for (const idx of indices) {
        referencedAsChild.add(idx);
      }
    }
  }

  // 2. Recursive builder
  const buildNode = (idx: number): StructureTreeNode => {
    const [tag, ...indices] = tuples[idx];
    const isComp = tag.startsWith(TAG_COMPONET_PREFIX);
    const id = isComp ? tag.slice(TAG_COMPONET_PREFIX.length) : undefined;

    const node: StructureTreeNode = { _idx: idx, tag, id };

    if (isComp && id) {
      // Component: expand recursively from its own data entry
      const subtree = buildComponentTree(id, data);
      if (subtree.length > 0) {
        node.children = subtree;
      }
    } else {
      // Regular node: recursively build explicit children
      if (indices.length > 0) {
        node.children = indices.map(buildNode);
      }
    }

    return node;
  };

  // 3. Root nodes of this component are those NOT referenced as a child of another node
  return tuples
    .map((_, idx) => idx)
    .filter((idx) => !referencedAsChild.has(idx))
    .map(buildNode);
}

/**
 * Utility for parsing a single component's structure map into a tree for debugging.
 * Does not expand component boundaries — use buildDomTree for the full recursive tree.
 */
export function renderStructureMapToTree(structureMap: StructureMapTuple[]): StructureTreeNode[] {
  if (!structureMap || structureMap.length === 0) return [];

  const nodes: StructureTreeNode[] = structureMap.map((tuple, index) => ({
    _idx: index,
    tag: tuple[0],
    id: tuple[0].startsWith(TAG_COMPONET_PREFIX) ? tuple[0].slice(TAG_COMPONET_PREFIX.length) : undefined,
  }));

  const isChild = new Set<number>();

  structureMap.forEach((tuple, index) => {
    const parent = nodes[index];
    if (parent.tag.startsWith(TAG_COMPONET_PREFIX)) return;

    for (let i = 1; i < tuple.length; i++) {
      const childIdx = tuple[i] as number;
      if (nodes[childIdx]) {
        if (!parent.children) parent.children = [];
        parent.children.push(nodes[childIdx]);
        isChild.add(childIdx);
      }
    }
  });

  return nodes.filter((_, idx) => !isChild.has(idx));
}

/**
 * Converts a structure tree back into a structure map.
 */
export function treeToStructureMap(roots: StructureTreeNode[]): StructureMapTuple[] {
  const allNodes: StructureTreeNode[] = [];

  const collect = (node: StructureTreeNode) => {
    allNodes.push(node);
    node.children?.forEach(collect);
  };
  roots.forEach(collect);

  allNodes.sort((a, b) => a._idx - b._idx);

  const structureMap: StructureMapTuple[] = new Array(allNodes.length);

  allNodes.forEach((node) => {
    const tuple: StructureMapTuple = [node.tag] as StructureMapTuple;
    node.children?.forEach((child) => tuple.push(child._idx));
    structureMap[node._idx] = tuple;
  });

  return structureMap;
}
