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
 * const entries = Array.from(scope.observables.entries());
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
    // Only include parents field if there are actual parents (saves space in JSON)
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
