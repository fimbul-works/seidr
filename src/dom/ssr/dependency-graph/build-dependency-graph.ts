import type { Seidr } from "../../../seidr.js";
import type { DependencyGraph, DependencyNode } from "./types.js";

/**
 * Builds a numeric dependency graph from registered Seidr instances.
 *
 * This function traverses all registered Seidr instances and builds
 * a compact numeric graph representation. The numeric IDs are assigned
 * based on the order of instances in the entries array, providing
 * deterministic and stable IDs across render passes.
 *
 * @param entries - Array of [id, seidr] tuples from SSRScope.observables
 *
 * @returns A dependency graph with numeric IDs
 *
 * @example
 * ```typescript
 * const scope = new SSRScope();
 * const firstName = new Seidr("John");
 * const lastName = new Seidr("Doe");
 * const fullName = Seidr.computed(
 *   () => `${firstName.value} ${lastName.value}`,
 *   [firstName, lastName]
 * );
 *
 * const entries = Object.entries(scope.observables);
 * const graph = buildDependencyGraph(entries);
 *
 * // Result (indices based on entry order):
 * // {
 * //   nodes: [
 * //     { id: 0, parents: [] },       // firstName (index 0)
 * //     { id: 1, parents: [] },       // lastName (index 1)
 * //     { id: 2, parents: [0, 1] }    // fullName (index 2, depends on 0, 1)
 * //   ],
 * //   rootIds: [0, 1]                // firstName and lastName are roots
 * // }
 * ```
 */
export function buildDependencyGraph(entries: [string, Seidr<any>][]): DependencyGraph {
  const nodes: DependencyNode[] = [];
  const rootIds: number[] = [];

  // Build a Map for quick lookup of Seidr instance -> numeric ID
  const idMap = new Map<Seidr<any>, number>();

  // First pass: assign numeric IDs based on entry order
  entries.forEach(([_, seidr], index) => {
    idMap.set(seidr, index);
  });

  // Second pass: build nodes with parent references
  entries.forEach(([_, seidr], index) => {
    const node: DependencyNode = {
      id: index,
      parents: [],
    };

    // Convert parent Seidr instances to numeric IDs
    if (seidr.parents.length > 0) {
      node.parents = seidr.parents.map((parent) => {
        const parentId = idMap.get(parent);
        if (parentId === undefined) {
          throw new Error(
            `Parent Seidr instance not found in registered observables. This indicates a critical SSR scope error.`,
          );
        }
        return parentId;
      });
    }

    nodes.push(node);

    // Track root observables (no parents = not derived)
    if (!seidr.isDerived) {
      rootIds.push(index);
    }
  });

  return { nodes, rootIds };
}

/**
 * Traverses the dependency graph from a given node to find root values.
 *
 * This function follows the parent chain from any node to find all root
 * observables it depends on. The traversal keeps track of the dependency
 * indices at each level, allowing precise reconstruction of the value path.
 *
 * @param graph - The dependency graph
 * @param startId - The numeric ID of the node to start traversal from
 *
 * @returns Array of paths, where each path is an array of indices leading from startId to a root
 *
 * @example
 * ```typescript
 * // Given graph:
 * // count (0) -> doubled (1) -> quadrupled (2)
 * const graph = {
 *   nodes: [
 *     { id: 0, parents: [] },      // count (root)
 *     { id: 1, parents: [0] },     // doubled (depends on count)
 *     { id: 2, parents: [1] }      // quadrupled (depends on doubled)
 *   ],
 *   rootIds: [0]
 * };
 *
 * // Find paths from quadrupled (id: 2) to roots
 * const paths = findPathsToRoots(graph, 2);
 * // Result: [[1, 0]]
 * // Meaning: quadrupled.parents[1].parents[0] = count
 * ```
 */
export function findPathsToRoots(graph: DependencyGraph, startId: number): number[][] {
  const paths: number[][] = [];
  const currentPath: number[] = [];

  function traverse(nodeId: number): void {
    const node = graph.nodes[nodeId];

    if (node.parents.length === 0) {
      // Found a root - save the path
      paths.push([...currentPath]);
      return;
    }

    // Traverse each parent
    for (let i = 0; i < node.parents.length; i++) {
      currentPath.push(i);
      traverse(node.parents[i]);
      currentPath.pop();
    }
  }

  traverse(startId);
  return paths;
}

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
