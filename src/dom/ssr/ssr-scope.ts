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
  // id -> instance
  private observables = new Map<string, Seidr<any>>();
  // child -> parents[]
  private parents = new Map<string, string[]>();
  // observale -> [elementId, prop]
  private bindings = new Map<string, [string, string]>();

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
    console.log("Registering Seidr", seidr.id);
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
    console.log("Registering derived Seidr", seidr.id, "with parents", ids);
    this.parents.set(seidr.id, ids);
  }

  /**
   * Registers binding between SeidrElement and a Seidr class instance.
   * Called during SSR rendering of an element to keep track.
   *
   * @param seidr - The Seidr instance to register
   */
  registerBindings(observableId: string, elementId: string, property: string): void {
    console.log("Registering bindings", observableId, "for element", elementId, "prop", property);
    this.bindings.set(observableId, [elementId, property]);
  }

  /**
   * Captures the current state of all root observables in this scope.
   *
   * Only captures root observables (isDerived = false), not derived or
   * computed observables, since those will be recreated on the client.
   *
   * After capturing state, this method clears the observables map to prevent
   * memory leaks. This ensures that references to Seidr instances are released
   * after the render pass is complete.
   *
   * @returns The captured state with observable IDs mapped to their values
   */
  captureState(): SSRState {
    const state: SSRState = {
      observables: {},
    };

    console.log("BINDINGS", Object.entries(this.bindings));
    console.log("DERIVED", Object.entries(this.parents));

    for (const [id, observable] of this.observables) {
      // Only capture root observables, not derived/computed ones
      if (!observable.isDerived) {
        state.observables[id] = observable.value;
      }
    }

    // Clear observables map to prevent memory leaks
    this.observables.clear();

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
