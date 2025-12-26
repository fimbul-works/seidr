import type { DependencyGraph } from "./types";

/**
 * Validates that the dependency graph is well-formed.
 *
 * Checks for:
 * - All parent IDs exist in the graph
 * - No circular dependencies
 * - All root observables are correctly identified
 *
 * @param graph - The dependency graph to validate
 *
 * @returns Object with validation result and any errors found
 *
 * @example
 * ```typescript
 * const result = validateDependencyGraph(graph);
 * if (!result.valid) {
 *   console.error("Invalid graph:", result.errors);
 * }
 * ```
 */
export function validateDependencyGraph(graph: DependencyGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeIdSet = new Set(graph.nodes.map((n) => n.id));

  // Check 1: All parent IDs exist
  for (const node of graph.nodes) {
    for (const parentId of node.parents) {
      if (!nodeIdSet.has(parentId)) {
        errors.push(`Node ${node.id} has parent ${parentId} that doesn't exist in the graph`);
      }
    }
  }

  // Check 2: No circular dependencies
  const visiting = new Set<number>();
  const visited = new Set<number>();

  function hasCycle(nodeId: number, path: number[]): boolean {
    if (visiting.has(nodeId)) {
      errors.push(`Circular dependency detected: ${path.join(" -> ")} -> ${nodeId}`);
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);
    const node = graph.nodes[nodeId];

    // Check if node exists (might not if parent ID is invalid)
    if (!node) {
      errors.push(`Node ${nodeId} not found in graph`);
      visiting.delete(nodeId);
      return false;
    }

    for (const parentId of node.parents) {
      if (hasCycle(parentId, [...path, nodeId])) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      hasCycle(node.id, []);
    }
  }

  // Check 3: Root observables match isDerived flag
  for (const rootId of graph.rootIds) {
    const node = graph.nodes[rootId];
    if (node.parents.length > 0) {
      errors.push(`Root ID ${rootId} has parents, but should be a root observable`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
