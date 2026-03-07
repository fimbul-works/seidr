import type { Seidr } from "../../seidr/seidr";
import { isEmpty } from "../../util/type-guards/primitive-types";
import { getHydrationData, isHydrating } from "./storage";

/**
 * Registers a Seidr instance during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 */
export const registerHydratingSeidr = (seidr: Seidr): void => {
  if (seidr.isDerived || !isHydrating()) {
    return;
  }

  const hydrationData = getHydrationData();
  if (!hydrationData?.registry || hydrationData.registry.has(seidr)) {
    return;
  }

  const value = hydrationData?.data?.state?.[seidr.id];
  if (!isEmpty(value)) {
    hydrationData.registry.add(seidr);
    seidr.value = value;
  }
};
