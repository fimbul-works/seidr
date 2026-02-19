import type { ComponentType } from "../../component/types";
import { mount } from "../../dom/mount";
import type { CleanupFunction } from "../../types";
import { isUndefined } from "../../util/type-guards/primitive-types";
import { clearHydrationData } from "./clear-hydration-data";
import { setHydrationData } from "./set-hydration-data";
import type { HydrationData } from "./types";

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * @template {ComponentType} T - The type of the component, which can be a factory or a component instance
 * @param {T} factory - The component or factory to hydrate
 * @param {HTMLElement} container - The HTMLElement to mount the hydrated component into
 * @param {HydrationData} hydrationData - The previously captured hydration data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 */
export function hydrate<T extends ComponentType>(
  factory: T,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction {
  if (isUndefined(hydrationData.ctxID)) {
    console.warn("Hydration data is missing context ID, falling back to normal mount");
    return mount(factory, container);
  }

  setHydrationData(hydrationData, container);
  container.innerHTML = ""; // TODO: fixme
  const unmount = mount(factory, container);
  clearHydrationData();

  return unmount;
}
