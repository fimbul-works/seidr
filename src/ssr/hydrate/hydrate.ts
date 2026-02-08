import type { SeidrComponentChildren } from "src/component";
import { mount } from "../../dom/mount";
import type { CleanupFunction } from "../../types";
import { isUndefined } from "../../util/type-guards/primitive-types";
import { clearHydrationData } from "./clear-hydration-data";
import { setHydrationData } from "./set-hydration-data";
import type { HydrationData } from "./types";

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * @param {(...args: any[]) => T} factory - Function that returns a Seidr Component
 * @param {HTMLElement} container - The HTMLElement to mount the hydrated component into
 * @param {HydrationData} hydrationData - The previously captured hydration data with ctxID
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 */
export function hydrate<T extends () => SeidrComponentChildren = () => SeidrComponentChildren>(
  factory: T,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction {
  if (isUndefined(hydrationData.ctxID)) {
    console.warn("Hydration data is missing ctxID");
    return mount(factory as T, container);
  }

  setHydrationData(hydrationData, container);
  const unmount = mount(factory as T, container);
  clearHydrationData();

  return unmount;
}
