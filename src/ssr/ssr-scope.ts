import type { RenderContext, Seidr } from "../core/index";
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
  let ctx: RenderContext | undefined;
  try {
    ctx = getRenderContext();
  } catch (_e) {
    if (scope === undefined) return;
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
  let ctx: RenderContext | undefined;
  try {
    ctx = getRenderContext();
  } catch (_e) {
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
  private observables = new Map<number, Seidr<any>>();
  // child -> parents[]
  private parents = new Map<number, number[]>();
  // observable -> [elementId, prop]
  private bindings = new Map<number, [string, string]>();
  // Async tasks to await during SSR
  private promises: Promise<any>[] = [];

  /**
   * Registers a promise to be awaited before finishing the SSR render.
   * Useful for inServer() async tasks.
   *
   * @param promise - The promise to track
   */
  trackPromise(promise: Promise<any>): void {
    this.promises.push(promise);
  }

  /**
   * Waits for all registered promises in this scope to resolve.
   * Called by renderToString before finalizing the HTML output.
   */
  async waitForPromises(): Promise<void> {
    // We loop in case resolving one promise kicks off more async work
    while (this.promises.length > 0) {
      const pending = [...this.promises];
      this.promises = [];
      await Promise.all(pending);
    }
  }

  /**
   * Returns the number of observables registered in this scope.
   * Useful for debugging and testing.
   */
  get size(): number {
    return this.observables.size;
  }

  /**
   * Registers an observable with this scope.
   * Called automatically by Seidr during SSR rendering when first observed/bound.
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
   * @param observableId - The numeric ID of the Seidr instance
   * @param elementId - The data-seidr-id of the element
   * @param property - The property name on the element
   */
  registerBindings(observableId: number, elementId: string, property: string): void {
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
    // Sort by ID to ensure deterministic order regardless of registration order
    const entries = Array.from(this.observables.entries()).sort((a, b) => a[0] - b[0]);
    const graph = buildDependencyGraph(entries);

    // Step 2: Build ID mapping (numeric ID -> index in entries array)
    const idToIndex = new Map<number, number>();
    entries.forEach(([numericId, _], index) => {
      idToIndex.set(numericId, index);
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
        const index = idToIndex.get(observableId);
        if (index === undefined) {
          console.warn(`Bound observable ${observableId} not found in registered observables`);
          continue;
        }
        neededIds.add(index);

        // Add all transitive dependencies
        this.addTransitiveDependencies(index, graph, neededIds);
      }
    }

    // Step 4: Build element bindings with paths
    const bindings: Record<string, ElementBinding[]> = {};

    for (const [observableId, [elementId, property]] of this.bindings) {
      const index = idToIndex.get(observableId);
      if (index === undefined) continue;

      // Find paths from this observable to all roots
      const paths = findPathsToRoots(graph, index);

      if (!bindings[elementId]) {
        bindings[elementId] = [];
      }

      const binding: { id: number; prop: string; paths?: number[][] } = {
        id: index,
        prop: property,
      };

      // Only include paths if we have actual path data (not just [[]] for root observables)
      // [[]] means the observable IS a root (no traversal needed), so we omit the paths field
      if (paths.length > 0 && paths[0].length > 0) {
        binding.paths = paths;
      }

      bindings[elementId].push(binding);
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
    const parents = node.parents || [];

    for (const parentId of parents) {
      if (!neededIds.has(parentId)) {
        neededIds.add(parentId);
        this.addTransitiveDependencies(parentId, graph, neededIds);
      }
    }
  }

  /**
   * Checks if an observable with the given ID is registered in this scope.
   */
  has(id: number): boolean {
    return this.observables.has(id);
  }

  /**
   * Gets an observable by ID from this scope.
   */
  get(id: number): Seidr<any> | undefined {
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
    const hasParents = new Set<number>();
    for (const [, parents] of this.parents.entries()) {
      parents.forEach((parentId) => hasParents.add(parentId));
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
