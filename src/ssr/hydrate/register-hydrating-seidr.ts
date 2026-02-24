import type { Seidr } from "../../seidr/seidr";
import { isEmpty } from "../../util/type-guards/primitive-types";
import { hasHydrationData } from "./has-hydration-data";
import { hydrationDataStorage } from "./storage";

/**
 * Registers a Seidr instance during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 */
export const registerHydratingSeidr = (seidr: Seidr): void => {
  if (!hasHydrationData() || hydrationDataStorage.registry.has(seidr)) {
    return;
  }

  if (seidr.isDerived) {
    return;
  }

  const value = hydrationDataStorage.data?.observables[seidr.id];
  if (!isEmpty(value)) {
    // console.log("hydrating", seidr.id, ":", seidr.value, "=>", hydrationDataStorage.data?.observables[seidr.id]);
    hydrationDataStorage.registry.add(seidr);
    seidr.value = value;
  }
};
