import { DATA_KEY_STATE } from "../../seidr/constants.js";
import type { Seidr } from "../../seidr/seidr.js";
import { isEmpty } from "../../util/type-guards/primitive-types.js";
import { getHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrate Seidr state value during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 */
export const hydrateSeidrState = (seidr: Seidr): void => {
  if (seidr.isDerived || seidr.options.hydrate === false || !isHydrating()) {
    return;
  }

  const hydrationData = getHydrationData()!;
  if (hydrationData.registry.has(seidr)) {
    return;
  }

  const value = hydrationData.data[DATA_KEY_STATE][seidr.id];
  if (!isEmpty(value)) {
    hydrationData.registry.add(seidr);
    seidr.value = value;
  }
};
