import type { Seidr } from "../../seidr.js";
import type { DependencyGraph } from "./dependency-graph/types.js";
import type { ElementBinding, HydrationData } from "./types.js";

/**
 * Global hydration context for client-side hydration.
 * Used during element creation to restore observable values.
 */
let hydrationContext: HydrationData | null = null;

/**
 * Global map of hydration contexts for client-side hydration.
 * Mapping render scope ID to HydrationData.
 * Used during element creation to restore observable values.
 */
const hydrationContexts = new Map<number, HydrationData>();

/**
 * Registry to track Seidr instances during hydration in creation order.
 * This ensures numeric IDs match the server-side order.
 */
const hydrationRegistry: Seidr<any>[] = [];

/**
 * Registry to track Seidr instances during hydration in creation order.
 * Mapping render scope ID to array of Seidr instances.
 * This ensures numeric IDs match the server-side order.
 */
const hydrationRegistries = new Map<number, Seidr<any>[]>();

/**
 * Sets the current hydration context.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param data - The hydration data containing observables, bindings, and graph
 */
export function setHydrationContext(data: HydrationData): void {
  hydrationContext = data;
  // Clear registry when setting new context
  hydrationRegistry.length = 0;
}

/**
 * Gets the current hydration context.
 *
 * @returns The current hydration data
 */
export function getHydrationContext(): HydrationData | null {
  return hydrationContext;
}

/**
 * Clears the current hydration context.
 * Call this after hydration is complete.
 */
export function clearHydrationContext(): void {
  hydrationContext = null;
  hydrationRegistry.length = 0;
}

/**
 * Checks if hydration is currently active.
 *
 * @returns true if in hydration mode with data available
 */
export function isHydrating(): boolean {
  return hydrationContext !== null;
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

  const numericId = hydrationRegistry.length;
  hydrationRegistry.push(seidr);

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
export function applyElementBindings(elementId: string, element: Element): void {
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
    applyBinding(binding, elementId);
  }
}

/**
 * Applies a single binding by traversing paths to root observables.
 *
 * @param binding - The binding to apply
 * @param elementId - The element ID (for debugging)
 */
function applyBinding(binding: ElementBinding, elementId: string): void {
  const { seidrId, prop, paths } = binding;
  const graph = hydrationContext!.graph;

  // Get the Seidr instance that this binding references
  const boundSeidr = hydrationRegistry[seidrId];
  if (!boundSeidr) {
    console.error(`Hydration: Seidr #${seidrId} not found in registry`);
    return;
  }

  // For each path, traverse to the root and set its value
  for (const path of paths) {
    const rootNumericId = traversePathToRoot(seidrId, path, graph);

    if (rootNumericId !== null && hydrationContext!.observables[rootNumericId] !== undefined) {
      const rootSeidr = hydrationRegistry[rootNumericId];
      if (rootSeidr && !rootSeidr.isDerived) {
        const hydratedValue = hydrationContext!.observables[rootNumericId];
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

/**
 * Gets the hydrated value for an observable by numeric ID.
 *
 * @param numericId - The numeric ID of the observable
 * @returns The hydrated value or undefined if not found
 *
 * @deprecated Use registerHydratedSeidr() instead - values are auto-applied
 */
export function getHydratedValue(numericId: number): any {
  return hydrationContext?.observables[numericId];
}
