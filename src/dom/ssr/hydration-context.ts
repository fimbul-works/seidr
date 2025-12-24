import type { HydrationData } from "./types";

/**
 * Global hydration context for client-side hydration.
 * Used during element creation to restore observable values.
 */
const hydrationContext: HydrationData = {};

/**
 * Sets the current hydration context.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param data - The hydration data containing state and optionally scope
 */
export function setHydrationContext(data: HydrationData): void {
  hydrationContext.scope = data.scope;
  hydrationContext.state = data.state;
}

/**
 * Gets the current hydration context.
 *
 * @returns The current hydration data
 */
export function getHydrationContext(): HydrationData {
  return hydrationContext;
}

/**
 * Clears the current hydration context.
 * Call this after hydration is complete.
 */
export function clearHydrationContext(): void {
  hydrationContext.scope = undefined;
  hydrationContext.state = undefined;
}

/**
 * Checks if hydration is currently active.
 *
 * @returns true if in hydration mode with state available
 */
export function isHydrating(): boolean {
  return hydrationContext.state !== undefined;
}

/**
 * Gets the hydrated value for an observable by ID.
 *
 * @param id - The observable's ID
 * @returns The hydrated value or undefined if not found
 */
export function getHydratedValue(id: string): any {
  return hydrationContext.state?.observables[id];
}
