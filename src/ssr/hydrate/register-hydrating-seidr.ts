import type { Seidr } from "../../seidr/seidr";
import { isUndefined } from "../../util/type-guards/primitive-types";
import { hasHydrationData } from "./has-hydration-data";
import { hydrationDataStorage } from "./storage";

/**
 * Registers a Seidr instance during hydration.
 * Called automatically by Seidr constructor when in hydration mode.
 *
 * @param {Seidr<any>} seidr - The Seidr instance to register
 */
export function registerHydratingSeidr(seidr: Seidr<any>): void {
  if (!hasHydrationData() || hydrationDataStorage.registry.has(seidr)) {
    return;
  }

  if (seidr.isDerived) {
    return;
  }

  const value = hydrationDataStorage.data?.observables[seidr.id];
  if (!isUndefined(value)) {
    // console.log(
    //   "registering ID",
    //   seidr.id,
    //   "value:",
    //   seidr.value,
    //   "data:",
    //   hydrationDataStorage.data?.observables[seidr.id],
    // );
    hydrationDataStorage.registry.add(seidr);
    seidr.value = value;
  }
}
