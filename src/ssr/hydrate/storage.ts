import { getAppState, setAppStateID } from "../../render-context/render-context";
import type { Seidr } from "../../seidr/seidr";
import { isEmpty } from "../../util";
import { HYDRATION_DATA_ID, HYDRATION_MAP_DATA_ID } from "./constants";
import type { HydrationData, HydrationDataStorage } from "./types";

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
export const hasHydrationData = (): boolean => !isEmpty(getHydrationData()?.data);

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param {HydrationData} data - The hydration data containing observables
 * @param {HTMLElement} root - The root element for hydration
 */
export function setHydrationData(data: HydrationData, root: HTMLElement): void {
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
  appState.deleteData(HYDRATION_MAP_DATA_ID);
};

/**
 * Map storing the relationship between client-created virtual nodes
 * and their corresponding hydrated server-side DOM nodes.
 * Used to route reactive updates to the actual elements in the DOM.
 *
 * @returns {WeakMap<Node, Node>} The hydration map
 */
export const getHydrationMap = (): WeakMap<Node, Node> => {
  if (process.env.CORE_DISABLE_SSR) {
    throw new Error("Hydration is not available in this build");
  }

  const appState = getAppState();
  let hydrationMap: WeakMap<Node, Node>;
  if (!appState.hasData(HYDRATION_MAP_DATA_ID)) {
    hydrationMap = new WeakMap<Node, Node>();
    appState.setData(HYDRATION_MAP_DATA_ID, hydrationMap);
  }
  return appState.getData(HYDRATION_MAP_DATA_ID)!;
};
