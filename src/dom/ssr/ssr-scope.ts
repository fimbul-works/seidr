import type { Seidr } from "../../seidr.js";
import type { SSRState } from "./types.js";

/**
 * SSRScope manages observables created during a single server-side render pass.
 *
 * Each render pass has its own scope to prevent cross-contamination between
 * concurrent renders. The scope tracks all Seidr instances created during
 * rendering and captures their state for hydration.
 */
export class SSRScope {
  private observables = new Map<string, Seidr<any>>();

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
   * @param observable - The Seidr instance to register
   */
  register(observable: Seidr<any>): void {
    this.observables.set(observable.id, observable);
  }

  /**
   * Captures the current state of all root observables in this scope.
   *
   * Only captures root observables (isDerived = false), not derived or
   * computed observables, since those will be recreated on the client.
   *
   * @returns The captured state with observable IDs mapped to their values
   */
  captureState(): SSRState {
    const state: SSRState = {
      observables: {},
    };

    for (const [id, observable] of this.observables) {
      // Only capture root observables, not derived/computed ones
      if (!observable.isDerived) {
        state.observables[id] = observable.value;
      }
    }

    return state;
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
}
