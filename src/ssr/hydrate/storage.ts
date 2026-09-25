import { getAppState, setAppStateID } from "../../app-state/app-state.js";
import { DATA_KEY_HYDRATION_DATA } from "../../constants.js";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import type { Value } from "../../observable/value.js";
import { registerStateStrategy } from "../register-state-strategy.js";
import type { HydrationData } from "../types.js";
import { unpackHydrationState } from "../util/state-tuple.js";
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

  // Register data strategy
  registerStateStrategy();

  const rawState = hydrationData.data?.[DATA_KEY_STATE];
  const stateMap: Map<string, any> = Array.isArray(rawState)
    ? unpackHydrationState(rawState)
    : new Map(Object.entries(rawState ?? {}));

  const appState = getAppState();
  appState.setData(DATA_KEY_HYDRATION_DATA, {
    ...hydrationData,
    registry: new Set<Value>(),
    stateMap,
  });
}

/**
 * Clears the hydration context.
 * This is called after hydration is complete.
 */
export const clearHydrationData = () => getAppState().deleteData(DATA_KEY_HYDRATION_DATA);
