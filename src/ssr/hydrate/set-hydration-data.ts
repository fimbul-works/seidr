import { deserializeFeatures } from "../../render-context/feature";
import { getRenderContext, setRenderContextID } from "../../render-context/render-context";
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
  hydrationDataStorage.registry.clear();
  setRenderContextID(data.ctxID);
  resetNextId();
  deserializeFeatures(getRenderContext(), data.features);
  hydrationDataStorage.data = data;
  hydrationDataStorage.data.root = root;

  // Restore state values from the server
  if (data.features?.[GLOBAL_STATE_FEATURE_ID]) {
    restoreGlobalState(data.features[GLOBAL_STATE_FEATURE_ID]);
  }
}
