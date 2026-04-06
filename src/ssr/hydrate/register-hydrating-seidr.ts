import type { Seidr } from "../../seidr/seidr.js";
import { isServer } from "../../util/environment/is-server.js";
import { isEmpty } from "../../util/type-guards/primitive-types.js";
import { getHydrationData, isHydrating } from "./storage.js";

/**
 * Registers a Seidr instance during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 */
export const registerHydratingSeidr = (seidr: Seidr): void => {
  if (seidr.isDerived || isServer() || !isHydrating()) {
    return;
  }

  const hydrationData = getHydrationData();
  if (!hydrationData?.registry || hydrationData.registry.has(seidr)) {
    return;
  }

  const value = hydrationData?.data?.data?.state?.[seidr.id];
  if (!isEmpty(value)) {
    hydrationData.registry.add(seidr);
    seidr.value = value;
  }
};
