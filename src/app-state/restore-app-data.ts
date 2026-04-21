import type { AppStateData } from "../ssr/types.js";
import { isArray, isFn } from "../util/type-guards/primitive-types.js";
import { getAppState } from "./app-state.js";
import type { AddonTuple } from "./types.js";

/**
 * Type guard to check if a value is an AddonTuple.
 * An AddonTuple is a tuple of [data, DataStrategy].
 *
 * @param {any} val - The value to check
 * @returns {val is AddonTuple} `true` if the value is an AddonTuple, `false` otherwise
 */
export const isAddonTuple = (val: any): val is AddonTuple =>
  isArray(val) && val.length === 2 && isArray(val[1]) && isFn(val[1][0]) && isFn(val[1][1]);

/**
 * Restores application data from the provided AppStateData.
 *
 * @param {AppStateData} appData - The application data to restore
 */
export function restoreAppStateData(appData: AppStateData): void {
  const appState = getAppState();
  Object.entries(appData).forEach(([key, val]) => {
    let data = val;

    // If it's an AddonTuple, register the strategy first
    if (isAddonTuple(val)) {
      const [tupleData, strategy] = val;
      appState.defineDataStrategy(key, ...strategy);
      data = tupleData;
    }

    const strategy = appState.getDataStrategy(key);
    if (strategy) {
      const [, restoreFn] = strategy;
      restoreFn(data);
    }
  });
}
