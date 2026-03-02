import { getFeature } from "../../render-context/feature";
import { getRenderContext } from "../../render-context/render-context";
import type { Seidr } from "../../seidr/seidr";
import { getGlobalStateFeature } from "../../state/feature";
import { symbolNames } from "../../state/storage";
import { buildStructureMap, type StructureMapTuple } from "../structure/structure-map";
import type { SSRScopeCapture } from "./types";

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
  // id -> Component
  private components = new Map<string, any>();
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
    this.observables.set(seidr.id, seidr);
  }

  /**
   * Registers a component with this scope for hydration path mapping.
   * @param {any} comp - The component instance
   */
  registerComponent(comp: any): void {
    this.components.set(comp.id, comp);
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
    const globalState = getFeature(getGlobalStateFeature(), getRenderContext());

    const observables: Record<string, any> = {};
    for (const seidr of this.observables.values()) {
      const symbol = symbolNames.get(seidr.id);
      if (!seidr.isDerived && (!symbol || !globalState.has(symbol))) {
        observables[seidr.id] = seidr.value;
      }
    }

    const components: Record<string, StructureMapTuple[]> = {};
    for (const comp of this.components.values()) {
      if (comp.indexedNodes && comp.indexedNodes.length > 0) {
        const map = buildStructureMap(comp);
        components[comp.id] = map;
      }
    }

    // Clear observables map to prevent memory leaks
    for (const seidr of this.observables.values()) {
      seidr.destroy();
    }
    this.observables.clear();
    this.components.clear();

    return {
      observables,
      components,
    };
  }
}
