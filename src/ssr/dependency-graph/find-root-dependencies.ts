import type { DependencyGraph } from "./types";

/**
 * Finds all root observable IDs that a given node depends on.
 *
 * This is a simpler version of findPathsToRoots that only returns the
 * root IDs without the full paths. Useful for quick dependency checks.
 *
 * @param graph - The dependency graph
 * @param nodeId - The numeric ID of the node
 *
 * @returns Set of root IDs that this node ultimately depends on
 */
export function findRootDependencies(graph: DependencyGraph, nodeId: number): Set<number> {
  const roots = new Set<number>();
  const visited = new Set<number>();

  function traverse(id: number): void {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.nodes[id];
    const parents = node.parents || [];

    if (parents.length === 0) {
      // Root observable
      roots.add(id);
    } else {
      // Traverse parents
      parents.forEach((parentId) => traverse(parentId));
    }
  }

  traverse(nodeId);
  return roots;
}
