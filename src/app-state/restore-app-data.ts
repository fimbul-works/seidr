import type { AppStateData } from "../ssr/types.js";
import { getAppState } from "./app-state.js";

/**
 * Restores application data from the provided AppStateData.
 *
 * @param {AppStateData} appData - The application data to restore
 */
export function restoreAppStateData(appData: AppStateData): void {
  const appState = getAppState();
  Object.entries(appData).forEach(([key, val]) => {
    const strategy = appState.getDataStrategy(key);
    if (strategy) {
      const [, restoreFn] = strategy;
      restoreFn(val);
    }
  });
}
