import { getAppState, setAppStateID } from "../../app-state/app-state.js";
import { restoreAppStateData } from "../../app-state/restore-app-data.js";
import { DATA_KEY_HYDRATION_DATA } from "../../constants.js";
import type { Seidr } from "../../seidr/seidr.js";
import type { HydrationData } from "../types.js";
import type { HydrationDataRegistry } from "./types.js";

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns {boolean} true if in hydration mode with data available
 */
export const isHydrating = (): boolean => getAppState().hasData(DATA_KEY_HYDRATION_DATA);

/**
 * Gets the current hydration data.
 *
 * @returns {HydrationDataRegistry | undefined}
 */
export const getHydrationData = (): HydrationDataRegistry | undefined => getAppState().getData(DATA_KEY_HYDRATION_DATA);

/**
 * Initializes the hydration data registry for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param {HydrationData} hydrationData - The hydration data containing AppState data and component map
 */
export function initHydrationData(hydrationData: HydrationData): void {
  setAppStateID(hydrationData.ctxID);

  const appState = getAppState();
  appState.setData(DATA_KEY_HYDRATION_DATA, {
    ...hydrationData,
    registry: new Set<Seidr>(),
  });

  restoreAppStateData(hydrationData.data);
}

/**
 * Clears the hydration context.
 * This is called after hydration is complete.
 */
export const clearHydrationData = (): void => getAppState().deleteData(DATA_KEY_HYDRATION_DATA) as any;
