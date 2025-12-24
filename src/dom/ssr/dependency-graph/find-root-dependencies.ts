import type { DependencyGraph } from "./types.js";

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
 *
 * @example
 * ```typescript
 * const graph = {
 *   nodes: [
 *     { id: 0, parents: [] },      // firstName
 *     { id: 1, parents: [] },      // lastName
 *     { id: 2, parents: [0, 1] }   // fullName
 *   ],
 *   rootIds: [0, 1]
 * };
 *
 * const roots = findRootDependencies(graph, 2);
 * // Result: Set {0, 1} - fullName depends on both firstName and lastName
 * ```
 */
export function findRootDependencies(graph: DependencyGraph, nodeId: number): Set<number> {
  const roots = new Set<number>();
  const visited = new Set<number>();

  function traverse(id: number): void {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.nodes[id];

    if (node.parents.length === 0) {
      // Root observable
      roots.add(id);
    } else {
      // Traverse parents
      node.parents.forEach((parentId) => traverse(parentId));
    }
  }

  traverse(nodeId);
  return roots;
}
