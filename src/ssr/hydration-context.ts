import type { Seidr } from "../core/seidr";
import type { DependencyGraph } from "./dependency-graph/types";
import type { ElementBinding, HydrationData } from "./types";

/**
 * Global hydration context for client-side hydration.
 * Since hydration is purely client-side, we only need one global context.
 */
let currentHydrationContext: HydrationData | undefined = undefined;

/**
 * Registry to track Seidr instances during hydration in creation order.
 * This ensures numeric IDs match the server-side order.
 */
let hydrationRegistry: Seidr<any>[] = [];

/**
 * Gets the current hydration context.
 *
 * @returns The current hydration data, or undefined if not hydrating
 */
function getCurrentHydrationContext(): HydrationData | undefined {
  return currentHydrationContext;
}

/**
 * Gets the current hydration registry.
 *
 * @returns The current registry
 */
function getCurrentRegistry(): Seidr<any>[] {
  return hydrationRegistry;
}

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param data - The hydration data containing observables, bindings, and graph
 */
export function setHydrationContext(data: HydrationData): void {
  currentHydrationContext = data;
  // Clear registry when setting new context
  hydrationRegistry = [];
}

/**
 * Gets the hydration context for the current render context.
 *
 * @returns The current hydration data, or null if not hydrating
 */
export function getHydrationContext(): HydrationData | null {
  const context = getCurrentHydrationContext();
  return context ?? null;
}

/**
 * Clears the hydration context.
 * Call this after hydration is complete.
 *
 * @param _renderContextID - Ignored, kept for backwards compatibility
 */
export function clearHydrationContext(_renderContextID?: number): void {
  currentHydrationContext = undefined;
  hydrationRegistry = [];
}

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns true if in hydration mode with data available
 */
export function isHydrating(): boolean {
  return getCurrentHydrationContext() !== undefined;
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
  if (!isHydrating()) return;

  const registry = getCurrentRegistry();
  const hydrationContext = getCurrentHydrationContext();

  const numericId = registry.length;
  registry.push(seidr);

  // Set hydrated value if this is a root observable with a value
  // This ensures roots are hydrated even before bindings are applied
  if (hydrationContext && hydrationContext.observables[numericId] !== undefined && !seidr.isDerived) {
    seidr.value = hydrationContext.observables[numericId];
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
 * @param element - The element being hydrated (for debugging)
 */
export function applyElementBindings(elementId: string): void {
  const hydrationContext = getCurrentHydrationContext();
  const registry = getCurrentRegistry();

  if (!hydrationContext) {
    console.warn("Hydration: No context available");
    return;
  }

  const bindings = hydrationContext.bindings[elementId];
  if (!bindings) {
    console.warn(`Hydration: No bindings found for element ${elementId}`);
    return;
  }

  for (const binding of bindings) {
    applyBinding(binding, hydrationContext, registry);
  }
}

/**
 * Applies a single binding by traversing paths to root observables.
 *
 * @param binding - The binding to apply
 * @param elementId - The element ID (for debugging)
 * @param hydrationContext - The current hydration context
 * @param registry - The current Seidr registry
 */
function applyBinding(binding: ElementBinding, hydrationContext: HydrationData, registry: Seidr<any>[]): void {
  const { seidrId, paths } = binding;
  const graph = hydrationContext.graph;

  // Get the Seidr instance that this binding references
  const boundSeidr = registry[seidrId];
  if (!boundSeidr) {
    console.error(`Hydration: Seidr #${seidrId} not found in registry`);
    return;
  }

  // For each path, traverse to the root and set its value
  for (const path of paths) {
    const rootNumericId = traversePathToRoot(seidrId, path, graph);

    if (rootNumericId !== null && hydrationContext.observables[rootNumericId] !== undefined) {
      const rootSeidr = registry[rootNumericId];
      if (rootSeidr && !rootSeidr.isDerived) {
        const hydratedValue = hydrationContext.observables[rootNumericId];
        rootSeidr.value = hydratedValue;
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

    if (parentIndex >= node.parents.length) {
      console.error(
        `Hydration: Invalid path index ${parentIndex} for node ${currentId} (only ${node.parents.length} parents)`,
      );
      return null;
    }

    currentId = node.parents[parentIndex];
  }

  return currentId;
}
