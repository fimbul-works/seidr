import { isHydrating } from "./storage.js";
import type { Value } from "../../observable/value.js";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import { unwrapValue } from "../../observable/unwrap-value.js";
import { isNullish } from "../../util/type-guards.js";
import { getHydrationData } from "./storage.js";

/**
 * Hydrate Value state value during hydration.
 * Called automatically when constructing a Value when in hydration mode.
 *
 * @param {Value} value - The Value instance to register
 */
export const hydrateValueState = (value: Value): void => {
  // Skip if not hydrating, or if this Seidr opts out of hydration, or if it's derived
  if (value.isDerived || value.hydrate === false || !isHydrating()) {
    return;
  }

  // Avoid rehydrating the same Seidr multiple times (can happen with shared state)
  const hydrationData = getHydrationData()!;
  if (hydrationData.registry.has(value)) {
    return;
  }

  // Look up the initial value for this Seidr from hydration data using its ID
  const hydrValue = hydrationData.data[DATA_KEY_STATE]?.[value.id];
  if (!isNullish(hydrValue)) {
    hydrationData.registry.add(value);
    const restored = unwrapValue(hydrValue);
    console.log(`[Hydration] Restoring Value "${value.id}" state:`, restored);
    value(restored);
  }
};
