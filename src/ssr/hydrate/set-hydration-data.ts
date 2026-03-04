import { setAppStateID } from "../../render-context/render-context";
import { hydrationDataStorage } from "./storage";
import type { HydrationData } from "./types";

/**
 * Sets the hydration context for client-side hydration.
 * Call this on the client before creating components with hydrated observables.
 *
 * @param {HydrationData} data - The hydration data containing observables
 */
export function setHydrationData(data: HydrationData, root: HTMLElement): void {
  if (process.env.VITEST) {
    const { getAppState: getTestAppState } = require("../../test-setup/render-context");
    if (getTestAppState) {
      const { setInternalAppState } = require("../../render-context/render-context");
      setInternalAppState(getTestAppState);
    }
  }

  hydrationDataStorage.registry.clear();
  data.root = root;
  hydrationDataStorage.data = data;

  setAppStateID(data.ctxID);
}
