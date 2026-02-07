import type { SeidrNode } from "../element";
import { mount } from "../mount";
import { setRenderContextID as setRenderContextIDBrowser } from "../render-context/render-context.browser";
import type { CleanupFunction } from "../types";

import { clearHydrationData, setHydrationData } from "./hydration-context";
import { restoreGlobalState } from "./state";
import type { HydrationData } from "./types";

let hydrationFlag = false;

// Use browser implementation or no-op for Node
let setRenderContextID = typeof window !== "undefined" ? setRenderContextIDBrowser : () => {};

// For tests, we might need to override it
if (typeof process !== "undefined" && (process.env as any).VITEST) {
  try {
    const testSetup = require("../test-setup");
    if (testSetup.setRenderContextID) {
      setRenderContextID = testSetup.setRenderContextID;
    }
  } catch (e) {
    // Ignore if test-setup not found
  }
}

/**
 * Checks if the framework is currently in hydration mode.
 *
 * @returns {boolean} True if hydrating
 */
export const isHydrating = (): boolean => hydrationFlag;

/**
 * Sets the hydration mode flag.
 * @param {boolean} value - Hydration mode status
 */
export const setHydrating = (value: boolean): void => {
  hydrationFlag = value;
};

/**
 * Resets the isHydrating flag (for testing).
 * @internal
 */
export const resetHydratingFlag = () => setHydrating(false);

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
  setHydrating(true);

  // Set the client render context ID from the server to ensure matching context
  const hasRenderContextID = hydrationData.ctxID !== undefined;
  if (hasRenderContextID) {
    setRenderContextID(hydrationData.ctxID!);
  }

  // Restore state values from the server
  if (hydrationData.state) {
    restoreGlobalState(hydrationData.state);
  }

  setHydrationData(hydrationData, container);

  const unmount = mount(factory, container);

  clearHydrationData();
  setHydrating(false);

  return unmount;
}
