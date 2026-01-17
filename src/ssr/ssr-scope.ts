import type { RenderContext, Seidr } from "../core/index";
import { getRenderContext } from "../core/render-context-contract";
import type { SSRScopeCapture } from "./types";

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
  // Async tasks to await during SSR
  private promises: Promise<any>[] = [];

  /**
   * Registers a promise to be awaited before finishing the SSR render.
   * Useful for inServer() async tasks.
   *
   * @param {Promise<any>} promise - The promise to track
   */
  addPromise(promise: Promise<any>): void {
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
   * @param {Seidr<any>} seidr - The Seidr instance to register
   */
  register(seidr: Seidr<any>): void {
    // console.log("Registering Seidr", seidr.id);
    this.observables.set(seidr.id, seidr);
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
   * Captures the current state for hydration.
   *
   * This method builds hydration data containing root observable values.
   *
   * After capturing state, this method clears the observables map to prevent
   * memory leaks. This ensures that references to Seidr instances are released
   * after the render pass is complete.
   *
   * @returns {SSRScopeCapture} The complete hydration data
   */
  captureHydrationData(): SSRScopeCapture {
    const observables: Record<number, any> = {};

    // Sort by ID to ensure deterministic order matching the client-side creation order
    const sortedObservables = Array.from(this.observables.values()).sort((a, b) => a.id - b.id);

    // We only capture root observables, but we must respect the index of ALL observables
    // to match the client-side registration order (which registers everything).
    // Actually, client-side only looks up if hydrationData.observables[numericId] exists.
    // If we skip derived ones in the array, the indices might mismatch if the client creates them in same order.

    // Client-side `registerHydratedSeidr` uses `hydrationRegistry.length` as the ID.
    // It pushes EVERY Seidr created to `hydrationRegistry`.
    // So the server must provide values at the indices corresponding to root Seidrs.

    sortedObservables.forEach((seidr, index) => {
      if (!seidr.isDerived) {
        observables[index] = seidr.value;
      }
    });

    // Clear observables map to prevent memory leaks
    // First destroy all observables to clean up observer relationships
    this.destroyObservables();
    this.observables.clear();

    return {
      observables,
    };
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
    // Destroy all observables
    for (const [, seidr] of this.observables) {
      seidr.destroy();
    }
  }
}
