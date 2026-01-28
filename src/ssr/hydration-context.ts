import type { Seidr } from "../core/seidr";
import type { HydrationData } from "./types";

/**
 * Global hydration context for client-side hydration.
 * Since hydration is purely client-side, we only need one global context.
 */
let hydrationData: HydrationData | undefined;

/**
 * Registry to track Seidr instances during hydration in creation order.
 * This ensures numeric IDs match the server-side order.
 */
let hydrationRegistry: Seidr<any>[] = [];
const hydrationSet = new Set<Seidr<any>>();

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param {HydrationData} data - The hydration data containing observables
 */
export function setHydrationData(data: HydrationData): void {
  hydrationData = data;
  // Clear registry when setting new context
  hydrationRegistry = [];
  hydrationSet.clear();
}

/**
 * Clears the hydration context.
 * Call this after hydration is complete.
 */
export function clearHydrationData(): void {
  hydrationData = undefined;
  hydrationRegistry = [];
  hydrationSet.clear();
}

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns {boolean} true if in hydration mode with data available
 */
export function hasHydrationData(): boolean {
  return hydrationData !== undefined;
}

/**
 * Registers a Seidr instance during hydration.
 *
 * Called automatically by Seidr constructor when in hydration mode.
 * Tracks instances in creation order to assign matching numeric IDs.
 *
 * @param {Seidr<any>} seidr - The Seidr instance to register
 */
export function registerHydratedSeidr(seidr: Seidr<any>): void {
  if (!hasHydrationData()) return;
  if (hydrationSet.has(seidr)) return;

  const numericId = hydrationRegistry.length;
  hydrationRegistry.push(seidr);
  hydrationSet.add(seidr);

  // Set hydrated value if this is a root observable with a value
  // This ensures roots are hydrated even before bindings are applied
  if (hydrationData && hydrationData.observables[numericId] !== undefined && !seidr.isDerived) {
    seidr.value = hydrationData.observables[numericId];
  }
}
