import { getAppState } from "../../app-state/app-state.js";
import { DATA_KEY_STATE } from "../../seidr/constants.js";
import type { Seidr } from "../../seidr/seidr.js";
import { unwrapSeidr } from "../../seidr/unwrap-seidr.js";
import { isEmpty } from "../../util/type-guards/primitive-types.js";
import { getHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrate Seidr state value during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 */
export const hydrateSeidrState = (seidr: Seidr): void => {
  // Skip if not hydrating, or if this Seidr opts out of hydration, or if it's derived
  if (seidr.isDerived || seidr.options.hydrate === false || !isHydrating()) {
    return;
  }

  // Avoid rehydrating the same Seidr multiple times (can happen with shared state)
  const hydrationData = getHydrationData()!;
  if (hydrationData.registry.has(seidr)) {
    return;
  }

  // Look up the initial value for this Seidr from hydration data using its ID
  const value = hydrationData.data[DATA_KEY_STATE]?.[seidr.id];
  if (!isEmpty(value)) {
    hydrationData.registry.add(seidr);
    seidr.value = unwrapSeidr(value);
  }
};
