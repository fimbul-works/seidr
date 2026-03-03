import { deserializeAppState } from "../../render-context/feature";
import { getAppState, setAppStateID } from "../../render-context/render-context";
import { resetNextId } from "../../render-context/reset-next-id";
import { GLOBAL_STATE_FEATURE_ID } from "../../state/feature";
import { restoreGlobalState } from "../state/restore-global-state";
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
  setAppStateID(data.ctxID);
  resetNextId();
  deserializeAppState(getAppState(), data.data);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Hydration-Debug] Hydration data set with ${Object.keys(data.components).length} components`);
  }

  // Restore state values from the server
  if (data.data?.[GLOBAL_STATE_FEATURE_ID]) {
    restoreGlobalState(data.data[GLOBAL_STATE_FEATURE_ID]);
  }
}
