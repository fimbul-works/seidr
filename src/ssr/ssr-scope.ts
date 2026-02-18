import { getRenderContext } from "../render-context/render-context";
import type { RenderContext } from "../render-context/types";
import type { Seidr } from "../seidr";
import { isClient } from "../util/environment/client";
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
export function setSSRScope(scope: SSRScope | undefined): void {
  if (isClient()) {
    return;
  }

  let ctx: RenderContext;
  try {
    ctx = getRenderContext();
  } catch {
    if (scope === undefined) {
      return;
    }
    scopes.set(-1, scope);
    return;
  }

  ctx = getRenderContext();
  if (scope === undefined) {
    scopes.delete(ctx.ctxID);
  } else {
    scopes.set(ctx.ctxID, scope);
  }
}

/**
 * Gets the SSR scope for the current render context.
 * Returns undefined if not in SSR mode or no scope is active for this context.
 *
 * @returns {(SSRScope | undefined)} The SSR scope for the current render context, or undefined
 */
export function getSSRScope(): SSRScope | undefined {
  const ctx: RenderContext = getRenderContext();
  return scopes.get(ctx.ctxID);
}

/**
 * Removes the SSR scope for a specific render context ID.
 * Called after rendering to prevent memory leaks.
 *
 * @param {number} ctxID - The render context ID to clear
 */
export function clearSSRScope(ctxID: number): void {
  scopes.delete(ctxID);
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
  private observables = new Map<string, Seidr>();
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
   * @param {Seidr} seidr - The Seidr instance to register
   */
  register(seidr: Seidr): void {
    // console.log("Registering Seidr", seidr.id, "at scope size", this.observables.size);
    this.observables.set(seidr.id, seidr);
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
  get(id: string): Seidr | undefined {
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
    const observables: Record<string, any> = {};
    // console.log(
    //   "Capturing hydration data",
    //   Array.from(this.observables.values().map((s) => ({ id: s.id, value: s.value }))),
    // );
    // // Use Seidr IDs as keys to match client-side hydration registry order
    for (const seidr of this.observables.values()) {
      if (!seidr.isDerived) {
        observables[seidr.id] = seidr.value;
      }
    }

    // Clear observables map to prevent memory leaks
    for (const seidr of this.observables.values()) {
      seidr.destroy();
    }
    this.observables.clear();

    return {
      observables,
    };
  }
}
