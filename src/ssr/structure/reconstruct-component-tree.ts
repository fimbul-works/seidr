import { TAG_COMPONENT_PREFIX } from "../../constants";
import type { ComponentTreeNode, StructureMapTuple } from "./types";

/**
 * Builds a complete virtual DOM tree from hydration component data.
 * @param {Record<string, StructureMapTuple[]>} componentStructures - Map of component ID to it's child structure
 * @return {ComponentTreeNode[]} Reconstructed component DOM tree
 */
export function reconstructComponentTree(
  componentStructures: Record<string, StructureMapTuple[]>,
): ComponentTreeNode[] {
  const componentIds = Object.keys(componentStructures);
  if (componentIds.length === 0) return [];

  // Root is usually the first component registered (e.g. App-1)
  const rootId = componentIds[0];
  return buildComponentTree(rootId, componentStructures);
}

/**
 * Builds a virtual DOM tree for a component.
 * @param {string} componentId
 * @param {Record<string, StructureMapTuple[]>} componentStructures
 * @return {ComponentTreeNode[]}
 */
function buildComponentTree(
  componentId: string,
  componentStructures: Record<string, StructureMapTuple[]>,
): ComponentTreeNode[] {
  const tuples = componentStructures[componentId];
  if (!tuples || !Array.isArray(tuples)) {
    if (tuples) {
      console.error(`[dom-tree] Warning: Component data for ${componentId} is not an array:`, typeof tuples);
    }
    return [];
  }
  if (tuples.length === 0) return [];

  // Identify all nodes that are referenced as children
  const referencedAsChild = new Set<number>();
  for (const tuple of tuples) {
    if (!tuple || !Array.isArray(tuple)) continue;
    const [tag, ...indices] = tuple;
    // Note: Component boundaries themselves (#component:X) don't list their indices in the tuple,
    // their structure is defined in data[X].
    if (!tag.startsWith(TAG_COMPONENT_PREFIX)) {
      for (const idx of indices) {
        referencedAsChild.add(idx);
      }
    }
  }

  // Recursive builder
  const buildNode = (idx: number): ComponentTreeNode => {
    const [tag, ...indices] = tuples[idx];
    const id = tag.startsWith(TAG_COMPONENT_PREFIX) ? tag.slice(TAG_COMPONENT_PREFIX.length) : undefined;
    const node: ComponentTreeNode = { creationIndex: idx, tag, id };

    if (id) {
      // Component: expand recursively from its own data entry
      const subtree = buildComponentTree(id, componentStructures);
      if (subtree.length > 0) {
        node.children = subtree;
      }
    } else if (indices.length > 0) {
      // Regular node: recursively build explicit children
      node.children = indices.map(buildNode);
    }

    return node;
  };

  // Root nodes of this component are those that are not referenced as children of any other node.
  return tuples
    .map((_, idx) => idx)
    .filter((idx) => !referencedAsChild.has(idx))
    .map(buildNode);
}
