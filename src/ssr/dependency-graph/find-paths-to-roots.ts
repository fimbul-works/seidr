import type { DependencyGraph } from "./types";

/**
 * Traverses the dependency graph from a given node to find root values.
 *
 * This function follows the parent chain from any node to find all root
 * observables it depends on. The traversal keeps track of the dependency
 * indices at each level, allowing precise reconstruction of the value path.
 *
 * @param {DependencyGraph} graph - The dependency graph
 * @param {number} startId - The numeric ID of the node to start traversal from
 * @returns {number[][]} Array of paths, where each path is an array of indices leading from startId to a root
 */
export function findPathsToRoots(graph: DependencyGraph, startId: number): number[][] {
  const paths: number[][] = [];
  const currentPath: number[] = [];

  function traverse(nodeId: number): void {
    const node = graph.nodes[nodeId];
    const parents = node.parents || [];

    if (parents.length === 0) {
      // Found a root - save the path
      paths.push([...currentPath]);
      return;
    }

    // Traverse each parent
    for (let i = 0; i < parents.length; i++) {
      currentPath.push(i);
      traverse(parents[i]);
      currentPath.pop();
    }
  }

  traverse(startId);
  return paths;
}
