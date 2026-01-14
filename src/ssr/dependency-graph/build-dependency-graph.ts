import type { Seidr } from "../../core/index";
import type { DependencyGraph, DependencyNode } from "./types";

/**
 * Builds a numeric dependency graph from registered Seidr instances.
 *
 * This function traverses all registered Seidr instances and builds
 * a compact numeric graph representation. The numeric IDs are assigned
 * based on the order of instances in the entries array, providing
 * deterministic and stable IDs across render passes.
 *
 * @param entries - Array of [numericId, seidr] tuples from SSRScope.observables
 * @returns A dependency graph with numeric IDs
 */
export function buildDependencyGraph(entries: [number, Seidr<any>][]): DependencyGraph {
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
    };

    // Convert parent Seidr instances to numeric IDs
    // Convert parent Seidr instances to numeric IDs
    // Only include parents field if there are actual parents (saves space in JSON)
    if (seidr.parents.length > 0) {
      const parentIds: number[] = [];

      seidr.parents.forEach((parent) => {
        const parentId = idMap.get(parent);
        if (parentId !== undefined) {
          parentIds.push(parentId);
        } else if (parent.options?.hydrate !== false) {
          // Only throw if the parent wasn't explicitly opted-out of hydration
          throw new Error(
            `Parent Seidr instance not found in registered observables. This indicates a critical SSR scope error.`,
          );
        }
      });

      if (parentIds.length > 0) {
        node.parents = parentIds;
      }
    }

    nodes.push(node);

    // Track root observables (no parents = not derived)
    if (!seidr.isDerived) {
      rootIds.push(index);
    }
  });

  return { nodes, rootIds };
}
