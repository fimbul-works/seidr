import type { Seidr } from "../core/seidr";
import type { DependencyGraph } from "./dependency-graph/types";
import type { HydrationData } from "./types";

/**
 * Global hydration context for client-side hydration.
 * Since hydration is purely client-side, we only need one global context.
 */
let hydrationData: HydrationData | undefined;

/**
 * Registry to track Seidr instances during hydration in creation order.
 * This ensures numeric IDs match the server-side order.
 */
let hydrationRegistry: Seidr<any>[] = [];

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param data - The hydration data containing observables, bindings, and graph
 */
export function setHydrationData(data: HydrationData): void {
  hydrationData = data;
  // Clear registry when setting new context
  hydrationRegistry = [];
}

/**
 * Clears the hydration context.
 * Call this after hydration is complete.
 */
export function clearHydrationData(): void {
  hydrationData = undefined;
  hydrationRegistry = [];
}

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns true if in hydration mode with data available
 */
export function hasHydrationData(): boolean {
  return hydrationData !== undefined;
}

/**
 * Registers a Seidr instance during hydration.
 *
 * Called automatically by Seidr constructor when in hydration mode.
 * Tracks instances in creation order to assign matching numeric IDs.
 *
 * @param seidr - The Seidr instance to register
 */
export function registerHydratedSeidr(seidr: Seidr<any>): void {
  if (!hasHydrationData()) return;

  const numericId = hydrationRegistry.length;
  hydrationRegistry.push(seidr);

  // Set hydrated value if this is a root observable with a value
  // This ensures roots are hydrated even before bindings are applied
  if (hydrationData && hydrationData.observables[numericId] !== undefined && !seidr.isDerived) {
    seidr.value = hydrationData.observables[numericId];
  }
}

/**
 * Applies element bindings from hydration data.
 *
 * Called when creating an element with data-seidr-id attribute.
 * Traverses the dependency graph using the stored paths to find
 * and set root observable values.
 *
 * @param elementId - The data-seidr-id value from the element
 */
export function applyElementBindings(elementId: string): void {
  if (!hydrationData) {
    return;
  }

  const bindings = hydrationData.bindings[elementId];
  if (!bindings) {
    return;
  }

  for (const binding of bindings) {
    const { id, paths } = binding;
    const graph = hydrationData.graph;

    // Get the Seidr instance that this binding references
    const boundSeidr = hydrationRegistry[id];
    if (!boundSeidr) {
      console.error(`Hydration: Seidr #${id} not found in registry`);
      return;
    }

    // For each path, traverse to the root and set its value
    // If paths is undefined, this means the binding is directly to a root observable
    const pathsToProcess = paths || [[]];

    for (const path of pathsToProcess) {
      const rootNumericId = traversePathToRoot(id, path, graph);

      if (rootNumericId !== null && hydrationData.observables[rootNumericId] !== undefined) {
        const rootSeidr = hydrationRegistry[rootNumericId];
        if (rootSeidr && !rootSeidr.isDerived) {
          const hydratedValue = hydrationData.observables[rootNumericId];
          rootSeidr.value = hydratedValue;
        }
      }
    }
  }
}

/**
 * Traverses a path from a Seidr instance to its root.
 *
 * The path is an array of parent indices. For example:
 * - [0] means this Seidr's first parent
 * - [1, 0] means this Seidr's second parent's first parent
 *
 * @param startId - The numeric ID to start from
 * @param path - Array of parent indices to traverse
 * @param graph - The dependency graph
 *
 * @returns The numeric ID of the root, or null if traversal fails
 */
function traversePathToRoot(startId: number, path: number[], graph: DependencyGraph): number | null {
  let currentId = startId;

  for (const parentIndex of path) {
    const node = graph.nodes[currentId];
    const parents = node.parents || [];

    if (parentIndex >= parents.length) {
      console.error(
        `Hydration: Invalid path index ${parentIndex} for node ${currentId} (only ${parents.length} parents)`,
      );
      return null;
    }

    currentId = parents[parentIndex];
  }

  return currentId;
}
