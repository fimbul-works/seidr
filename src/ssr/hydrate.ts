import type { SeidrNode } from "../element";
import { $query } from "../helper";
import { mount } from "../mount";
import { setRenderContextID as setRenderContextIDBrowser } from "../render-context/render-context.browser";
import type { CleanupFunction } from "../types";
import { clearHydrationData, setHydrationData } from "./hydration-context";
import { restoreGlobalState } from "./state";
import type { HydrationData } from "./types";

// Use browser implementation or no-op for Node
const setRenderContextID = typeof window !== "undefined" ? setRenderContextIDBrowser : () => {};

export let isHydrating: boolean = false;

/**
 * Resets the isHydrating flag (for testing).
 * @internal
 */
export function resetHydratingFlag() {
  isHydrating = false;
}

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * This function:
 * 1. Sets the client render context with the ID from hydrationData
 * 2. Sets the hydration context with the provided hydration data
 * 3. Executes the component factory function
 * 4. Seidr instances will use hydrated values during creation
 * 5. Mounts the component in the container
 * 6. Returns the live component without destroying it
 * 7. Restores the original contexts
 *
 * @param {(...args: any[]) => T} factory - Function that returns a Seidr Component
 * @param {HTMLElement} container - The HTMLElement to mount the hydrated component into
 * @param {HydrationData} hydrationData - The previously captured hydration data with ctxID
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 */
export function hydrate<T extends SeidrNode>(
  factory: () => T,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction {
  isHydrating = true;

  // Set the client render context ID from the server to ensure matching context
  const hasRenderContextID = hydrationData.ctxID !== undefined;
  if (hasRenderContextID) {
    setRenderContextID(hydrationData.ctxID!);
  }

  // Restore state values from the server
  if (hydrationData.state) {
    restoreGlobalState(hydrationData.state);
  }

  // Set the hydration context so Seidr instances get their server values
  setHydrationData(hydrationData);

  // Find existing root component after SSR
  const existingRoot = $query(`[data-seidr-root="${hasRenderContextID ? hydrationData.ctxID : "true"}"]`);

  // Create the component (Seidr instances will auto-hydrate)
  // Mount the component in the container
  const unmount = mount(factory, container);

  // Remove existing root component if found
  if (existingRoot) {
    existingRoot.remove();
  }

  // Clear the hydration context
  clearHydrationData();

  return unmount;
}
