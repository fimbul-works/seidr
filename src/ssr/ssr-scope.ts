import type { Seidr } from "../core/index";
import { getRenderContext } from "../core/render-context-contract";
import { buildDependencyGraph, findPathsToRoots } from "./dependency-graph/index";
import type { DependencyGraph } from "./dependency-graph/types";
import type { ElementBinding, SSRScopeCapture } from "./types";

/**
 * SSR scopes indexed by render context ID.
 * This ensures concurrent SSR requests have isolated scopes.
 */
const scopes = new Map<number, SSRScope>();

/**
 * Sets the active SSR scope for the current render context.
 * Call this before starting a render pass.
 *
 * @param {(SSRScope | undefined)} scope - The scope to activate for the current render context
 */
export function setActiveSSRScope(scope: SSRScope | undefined): void {
  const ctx = getRenderContext();

  // If no render context but setting undefined, allow for cleanup
  if (!ctx) {
    if (scope === undefined) {
      return;
    }

    // If no render context but setting a scope, use a temporary key
    // This supports the manual scope pattern where scope is set before renderToString
    scopes.set(-1, scope);
    return;
  }

  // Normal case: use render context ID
  if (scope) {
    scopes.set(ctx.renderContextID, scope);
  } else {
    scopes.delete(ctx.renderContextID);
  }
}

/**
 * Gets the SSR scope for the current render context.
 * Returns undefined if not in SSR mode or no scope is active for this context.
 *
 * @returns {(SSRScope | undefined)} The SSR scope for the current render context, or undefined
 */
export function getActiveSSRScope(): SSRScope | undefined {
  const ctx = getRenderContext();
  if (!ctx) {
    // Check for temporary scope (manual scope pattern)
    return scopes.get(-1);
  }

  return scopes.get(ctx.renderContextID);
}

/**
 * Removes the SSR scope for a specific render context ID.
 * Called after rendering to prevent memory leaks.
 *
 * @param {number} renderContextID - The render context ID to clear
 */
export function clearSSRScope(renderContextID: number): void {
  scopes.delete(renderContextID);
}

/**
 * SSRScope manages observables created during a single server-side render pass.
 *
 * Each render pass has its own scope to prevent cross-contamination between
 * concurrent renders. The scope tracks all Seidr instances created during
 * rendering and captures their state for hydration.
 */
export class SSRScope {
  // id -> instance
  private observables = new Map<string, Seidr<any>>();
  // child -> parents[]
  private parents = new Map<string, string[]>();
  // observable -> [elementId, prop]
  private bindings = new Map<string, [string, string]>();
  // Track element IDs in order of first binding
  private elementIds = [] as string[];

  /**
   * Returns the number of observables registered in this scope.
   * Useful for debugging and testing.
   */
  get size(): number {
    return this.observables.size;
  }

  /**
   * Registers an observable with this scope.
   * Called automatically by Seidr constructor during SSR rendering.
   *
   * @param seidr - The Seidr instance to register
   */
  register(seidr: Seidr<any>): void {
    // console.log("Registering Seidr", seidr.id);
    this.observables.set(seidr.id, seidr);
  }

  /**
   * Registers an observable with this scope
   * to build a dependency graph.
   *
   * @param seidr - The Seidr instance to register
   */
  registerDerived(seidr: Seidr<any>, parents: Seidr<any>[]): void {
    const ids = parents.map((s) => s.id);
    // console.log("Registering derived Seidr", seidr.id, "with parents", ids);
    this.parents.set(seidr.id, ids);
  }

  /**
   * Registers binding between SeidrElement and a Seidr class instance.
   * Called during SSR rendering of an element to keep track.
   *
   * @param observableId - The ID of the Seidr instance
   * @param elementId - The data-seidr-id of the element
   * @param property - The property name on the element
   */
  registerBindings(observableId: string, elementId: string, property: string): void {
    // Track element IDs in order of first binding
    if (!this.elementIds.includes(elementId)) {
      this.elementIds.push(elementId);
    }

    this.bindings.set(observableId, [elementId, property]);
  }

  /**
   * Captures the current state for hydration.
   *
   * This method builds complete hydration data including:
   * 1. Dependency graph of all observables
   * 2. Element bindings with traversal paths
   * 3. Root observable values
   *
   * If there are no bindings registered, captures ALL root observables.
   * If there are bindings, only captures observables with bindings and their
   * transitive dependencies. This keeps the hydration data compact.
   *
   * After capturing state, this method clears the observables map to prevent
   * memory leaks. This ensures that references to Seidr instances are released
   * after the render pass is complete.
   *
   * @returns The complete hydration data
   */
  captureHydrationData(): SSRScopeCapture {
    // Step 1: Build dependency graph from all registered observables
    const entries = Array.from(this.observables.entries());
    const graph = buildDependencyGraph(entries);

    // Step 2: Build ID mapping (string ID -> numeric ID)
    const idToNumeric = new Map<string, number>();
    entries.forEach(([stringId, _], index) => {
      idToNumeric.set(stringId, index);
    });

    // Step 3: Determine which observables to include
    const neededIds = new Set<number>();

    if (this.bindings.size === 0) {
      // No bindings - capture ALL root observables (for simple SSR)
      for (let i = 0; i < entries.length; i++) {
        const seidr = entries[i][1];
        if (!seidr.isDerived) {
          neededIds.add(i);
        }
      }
    } else {
      // Have bindings - only capture observables with bindings and dependencies
      const boundObservableIds = new Set(this.bindings.keys());

      for (const observableId of boundObservableIds) {
        const numericId = idToNumeric.get(observableId);
        if (numericId === undefined) {
          console.warn(`Bound observable ${observableId} not found in registered observables`);
          continue;
        }
        neededIds.add(numericId);

        // Add all transitive dependencies
        this.addTransitiveDependencies(numericId, graph, neededIds);
      }
    }

    // Step 4: Build element bindings with paths
    const bindings: Record<string, ElementBinding[]> = {};

    for (const [observableId, [elementId, property]] of this.bindings) {
      const numericId = idToNumeric.get(observableId);
      if (numericId === undefined) continue;

      // Find paths from this observable to all roots
      const paths = findPathsToRoots(graph, numericId);

      if (!bindings[elementId]) {
        bindings[elementId] = [];
      }

      bindings[elementId].push({
        seidrId: numericId,
        prop: property,
        paths,
      });
    }

    // Step 5: Capture root observable values
    const observables: Record<number, any> = {};

    for (const numericId of neededIds) {
      const seidr = entries[numericId][1];
      if (!seidr.isDerived) {
        observables[numericId] = seidr.value;
      }
    }

    // Clear observables map to prevent memory leaks
    // First destroy all observables to clean up observer relationships
    this.destroyObservables();
    this.observables.clear();

    return {
      elementIds: this.elementIds,
      observables,
      bindings,
      graph,
    };
  }

  /**
   * Recursively adds all transitive dependencies of a node to the set.
   *
   * @param nodeId - The numeric ID to start from
   * @param graph - The dependency graph
   * @param neededIds - Set to populate with needed IDs
   */
  private addTransitiveDependencies(nodeId: number, graph: DependencyGraph, neededIds: Set<number>): void {
    const node = graph.nodes[nodeId];

    for (const parentId of node.parents) {
      if (!neededIds.has(parentId)) {
        neededIds.add(parentId);
        this.addTransitiveDependencies(parentId, graph, neededIds);
      }
    }
  }

  /**
   * Checks if an observable with the given ID is registered in this scope.
   */
  has(id: string): boolean {
    return this.observables.has(id);
  }

  /**
   * Gets an observable by ID from this scope.
   */
  get(id: string): Seidr<any> | undefined {
    return this.observables.get(id);
  }

  /**
   * Clears all observables from this scope.
   * Called after rendering to prevent memory leaks.
   */
  clear(): void {
    this.observables.clear();
  }

  /**
   * Destroys all registered observables recursively.
   *
   * This method:
   * 1. Starts with root observables (those with no parents)
   * 2. Calls destroy() on each observable
   * 3. This recursively cleans up all derived observables that observe them
   *
   * Called after capturing hydration data to ensure proper cleanup.
   */
  destroyObservables(): void {
    // Start from roots and work down to avoid destroying parents before children
    const entries = Array.from(this.observables.entries());

    // Build a quick dependency map to find roots
    const hasParents = new Set<string>();
    for (const [, parents] of this.parents.entries()) {
      parents.forEach(parentId => hasParents.add(parentId));
    }

    // Destroy root observables first (those that aren't anyone's child)
    for (const [id, seidr] of entries) {
      if (!hasParents.has(id)) {
        seidr.destroy();
      }
    }

    // Then destroy all remaining observables (derived ones)
    for (const [, seidr] of entries) {
      seidr.destroy();
    }
  }
}
