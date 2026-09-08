import { encodeBase62 } from "@fimbul-works/futhark";
import { getAppState } from "../app-state/app-state.js";
import type { AppState } from "../app-state/types.js";
import type { SeidrComponent } from "../component/types.js";
import { DATA_KEY_SSR_SCOPE, SEIDR_COMPONENT_START_PREFIX } from "../constants.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import type { Value } from "../observable/value.js";
import { isServer } from "../util/environment/is-server.js";
import { registerStateStrategy } from "./register-state-strategy.js";
import { buildStructureMap } from "./structure/build-structure-map.js";
import type { StructureMapTuple } from "./structure/types.js";
import type { HydrationData } from "./types.js";

/**
 * Gets the SSR scope for the current render context.
 * Returns undefined if not in SSR mode or no scope is active for this context.
 *
 * @returns {SSRScope | undefined} The SSR scope for the current render context, or undefined
 */
export const getSSRScope = (): SSRScope | undefined => {
  try {
    return getAppState().getData<SSRScope>(DATA_KEY_SSR_SCOPE);
  } catch {
    return undefined;
  }
};

/**
 * Sets the active SSR scope for the current application state.
 *
 * @param {SSRScope | undefined} scope - The scope to activate for the current application state
 */
export function setSSRScope(scope: SSRScope | undefined): void {
  if (!isServer()) {
    return;
  }

  try {
    const state: AppState = getAppState();
    if (scope === undefined) {
      state.deleteData(DATA_KEY_SSR_SCOPE);
    } else {
      state.setData(DATA_KEY_SSR_SCOPE, scope);
    }
  } catch {
    // Ignore when outside app-state context
  }
}

/**
 * SSRScope manages observables and asynchronous tasks created during a single server-side render pass.
 *
 * Each render pass has its own scope to prevent cross-contamination between concurrent renders.
 */
export class SSRScope {
  // id -> SeidrComponent
  private components = new Map<string, SeidrComponent>();
  // Async tasks to await during SSR
  private promises: Promise<any>[] = [];

  /**
   * Creates an instance of SSRScope.
   *
   * @param {AppState} state - AppState instance for this render scope
   */
  constructor(private state: AppState) {
    registerStateStrategy();
  }

  /**
   * Returns the number of observables registered in this scope.
   */
  get size(): number {
    return this.state.getData<Map<string, Value>>(DATA_KEY_STATE)?.size ?? 0;
  }

  /**
   * Registers a promise to be awaited before finishing the SSR render.
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
    while (this.promises.length > 0) {
      const pending = [...this.promises];
      this.promises = [];
      await Promise.all(pending);
      await Promise.resolve();
    }
  }

  /**
   * Registers a component with this scope for hydration path mapping.
   * @param {SeidrComponent} comp - The component instance
   */
  registerComponent(comp: SeidrComponent): void {
    this.components.set(String(comp.id), comp);
  }

  /**
   * Unregisters a component from this scope.
   * @param {SeidrComponent} comp - The component instance
   */
  unregisterComponent(comp: SeidrComponent): void {
    this.components.delete(String(comp.id));
  }

  /**
   * Gets an observable Value by ID from this scope.
   */
  get(id: string): Value | undefined {
    return this.state.getData<Map<string, Value>>(DATA_KEY_STATE)?.get(id);
  }

  /**
   * Clears this scope and its underlying AppState.
   */
  clear(): void {
    this.components.clear();
    this.promises = [];
    this.state.destroy();
  }

  /**
   * Captures the current state for hydration.
   *
   * @returns {HydrationData} The complete hydration data
   */
  captureHydrationData(): HydrationData {
    const data: Record<string, any> = {};
    for (const [key, strategy] of this.state.strategies.entries()) {
      if (strategy) {
        const [captureFn] = strategy;
        data[key] = captureFn();
      }
    }

    const components: Record<string, StructureMapTuple[]> = {};
    const mountedComps = Array.from(this.components.values()).filter((c) => c.isMounted);

    const compIndices = new Map<string, number>();

    let index = 0;
    for (const comp of mountedComps) {
      const compIdStr =
        process.env.NODE_ENV === "production" ? encodeBase62(comp.id) : `${comp.name}-${encodeBase62(comp.id)}`;
      compIndices.set(compIdStr, index);

      const parentIdStr = comp.owner
        ? process.env.NODE_ENV === "production"
          ? encodeBase62(comp.owner.id)
          : `${comp.owner.name}-${encodeBase62(comp.owner.id)}`
        : null;
      const prefix =
        !parentIdStr || !compIndices.has(parentIdStr)
          ? SEIDR_COMPONENT_START_PREFIX
          : encodeBase62(compIndices.get(parentIdStr)!);
      const key = `${prefix}:${compIdStr}`;

      const map = buildStructureMap(comp);
      components[key] = map;
      index++;
    }

    this.clear();

    return {
      ctxID: this.state.ctxID,
      data,
      components,
    };
  }
}
