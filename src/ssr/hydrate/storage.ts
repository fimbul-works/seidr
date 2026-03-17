import { getAppState, setAppStateID } from "../../app-state/app-state";
import type { Seidr } from "../../seidr/seidr";
import { SeidrError } from "../../types";
import { isEmpty } from "../../util";
import type { HydrationData, HydrationDataStorage } from "./types";

const HYDRATION_DATA_ID = "seidr.ssr.hydrationdata";

/**
 * Gets the current hydration data.
 *
 * @returns {HydrationDataStorage | undefined}
 */
export const getHydrationData = (): HydrationDataStorage | undefined => getAppState().getData(HYDRATION_DATA_ID);

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns {boolean} true if in hydration mode with data available
 */
export const isHydrating = (): boolean => !isEmpty(getHydrationData()?.data);

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param {HydrationData} data - The hydration data containing observables
 * @param {HTMLElement} root - The root element for hydration
 */
export function setHydrationData(data: HydrationData, root: HTMLElement): void {
  if (isEmpty(data.ctxID)) {
    throw new SeidrError("Hydration data is missing context ID");
  }

  setAppStateID(data.ctxID);

  const appState = getAppState();
  appState.setData(HYDRATION_DATA_ID, {
    data: {
      ...data,
      root,
    },
    registry: new Set<Seidr>(),
  });
}

/**
 * Clears the hydration context.
 * This is called after hydration is complete.
 */
export const clearHydrationData = (): void => {
  const appState = getAppState();
  appState.deleteData(HYDRATION_DATA_ID);
};

