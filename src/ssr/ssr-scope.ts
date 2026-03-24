import { getAppState } from "../app-state/app-state";
import type { AppState } from "../app-state/types";
import type { Component } from "../component";
import type { Seidr } from "../seidr/seidr";
import { isServer } from "../util/environment/is-server";
import { buildStructureMap } from "./structure/build-structure-map";
import type { StructureMapTuple } from "./structure/types";

export const SSR_SCOPE_KEY = "seidr.ssr.scope";

/**
 * Internal hydration data captured by SSRScope.
 * This is combined with ctxID to form the complete HydrationData.
 */
export interface SSRScopeCapture {
  /**
   * Seidr ID -> value mapping for root observables.
   * Only contains root observables (isDerived = false).
   */
  state?: Record<string, any>;

  /**
   * Component ID -> Structure Map mapping.
   */
  components: Record<string, StructureMapTuple[]>;

  /**
   * Component IDs that were created and then destroyed during the SSR pass.
   */
  consumedIds?: number[];
}

/**
 * Gets the SSR scope for the current render context.
 * Returns undefined if not in SSR mode or no scope is active for this context.
 *
 * @returns {(SSRScope | undefined)} The SSR scope for the current render context, or undefined
 */
export const getSSRScope = (): SSRScope | undefined => getAppState().getData<SSRScope>(SSR_SCOPE_KEY);

/**
 * Sets the active SSR scope for the current application state.
 * Call this before starting a render pass.
 *
 * @param {(SSRScope | undefined)} scope - The scope to activate for the current application state
 */
export function setSSRScope(scope: SSRScope | undefined): void {
  if (!isServer()) {
    return;
  }

  try {
    const state: AppState = getAppState();
    if (scope === undefined) {
      state.deleteData(SSR_SCOPE_KEY);
    } else {
      state.setData(SSR_SCOPE_KEY, scope);
    }
  } catch (_e) {}
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
  private state = new Map<string, Seidr>();
  // id -> Component
  private components = new Map<string, Component>();
  // Async tasks to await during SSR
  private promises: Promise<any>[] = [];
  // Resolved results for inServer caching (callIndex -> result)
  private cache = new Map<number, any>();
  // Current inServer call index (resets per render pass)
  private _callIndex = 0;
  // Flag to indicate if we are in a stable (synchronous) render pass
  private _isStable = false;
  // State preserved from the first pass to populate the second pass
  private persistedState: Record<string, any> = {};

  /**
   * Registers a promise to be awaited before finishing the SSR render.
   * Useful for inServer() async tasks.
   *
   * @template T - Type the promise resolves to
   * @param {Promise<T>} promise - The promise to track
   * @return {Promise<T>} The promise for chaining
   */
  addPromise<T>(promise: Promise<T>): Promise<T> {
    this.promises.push(promise);
    return promise;
  }

  /**
   * Waits for all registered promises in this scope to resolve.
   * Called by renderToString before finalizing the HTML output.
   */
  async waitForPromises(): Promise<void> {
    // We loop in case resolving one promise kicks off more async work
    if (this.promises.length > 0) {
      this._hasAwaited = true;
    }
    while (this.promises.length > 0) {
      const pending = [...this.promises];
      this.promises = [];
      await Promise.all(pending);
    }
  }

  private _hasAwaited = false;
  get hasAwaited(): boolean {
    return this._hasAwaited;
  }

  /**
   * Returns the number of observables registered in this scope.
   * Useful for debugging and testing.
   */
  get size(): number {
    return this.state.size;
  }

  get callIndex(): number {
    return this._callIndex;
  }

  set callIndex(val: number) {
    this._callIndex = val;
  }

  get isStable(): boolean {
    return this._isStable;
  }

  set isStable(val: boolean) {
    this._isStable = val;
  }

  hasCachedResult(index: number): boolean {
    return this.cache.has(index);
  }

  getCachedResult(index: number): any {
    return this.cache.get(index);
  }

  setCachedResult(index: number, result: any): void {
    this.cache.set(index, result);
  }

  /**
   * Registers an observable with this scope.
   * Called automatically by Seidr during SSR rendering when first observed/bound.
   *
   * @param {Seidr} seidr - The Seidr instance to register
   */
  register(seidr: Seidr): void {
    this.state.set(seidr.id, seidr);

    // If we are in a stable re-render, populate from persisted state
    if (this._isStable && this.persistedState[seidr.id] !== undefined) {
      seidr.value = this.persistedState[seidr.id];
    }
  }

  /**
   * Registers a component with this scope for hydration path mapping.
   * @param {Component} comp - The component instance
   */
  registerComponent(comp: Component): void {
    this.components.set(comp.id, comp);
  }

  /**
   * Unregisters a component from this scope.
   * @param {Component} comp - The component instance
   */
  unregisterComponent(comp: Component): void {
    this.components.delete(comp.id);
  }

  /**
   * Checks if an observable with the given ID is registered in this scope.
   */
  has(id: string): boolean {
    return this.state.has(id);
  }

  /**
   * Gets an observable by ID from this scope.
   */
  get(id: string): Seidr | undefined {
    return this.state.get(id);
  }

  /**
   * Clears all observables from this scope.
   * Called after rendering to prevent memory leaks.
   */
  clear(): void {
    this.state.values().forEach((seidr) => seidr.destroy());
    this.state.clear();
    this.components.clear();
    this.cache.clear();
    this._callIndex = 0;
    this._isStable = false;
  }

  /**
   * Resets the scope for a new render pass (keeping the cache).
   */
  resetForStableRender(): void {
    // Capture state before resetting
    this.persistedState = {};
    for (const [id, seidr] of this.state) {
      if (!seidr.isDerived && seidr.options.hydrate !== false) {
        this.persistedState[id] = seidr.value;
      }
    }

    this.components.clear();
    this._callIndex = 0;
    this._isStable = true;
    // We keep this.cache so the next pass is synchronous
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
    const state: Record<string, any> = {};
    const values = Array.from(this.state.values());

    for (const seidr of values) {
      if (seidr.isDerived || seidr.options.hydrate === false) {
        continue;
      }
      state[seidr.id] = seidr.value;
    }

    const components: Record<string, StructureMapTuple[]> = {};
    for (const comp of this.components.values()) {
      if (comp.isMounted && comp.element) {
        const map = buildStructureMap(comp);
        components[comp.id] = map;
      }
    }

    // Clear observables map to prevent memory leaks
    values.forEach((seidr) => seidr.destroy());
    this.state.clear();
    this.components.clear();

    const consumedArray = Array.from(getAppState().consumedIds || []);

    return {
      state,
      components,
      consumedIds: consumedArray.length > 0 ? consumedArray : undefined,
    };
  }
}
