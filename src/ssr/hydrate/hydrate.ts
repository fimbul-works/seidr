import type { ComponentType } from "../../component/types";
import { mount } from "../../dom/mount";
import { type CleanupFunction, SeidrError } from "../../types";
import { initHydrationContext } from "./context/hydration-context";
import { clearHydrationData, isHydrating, setHydrationData } from "./storage";
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
export const hydrate = <T extends ComponentType>(
  factory: T,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction => {
  // If SSR is disabled, just mount
  if (process.env.CORE_DISABLE_SSR) {
    return mount(factory, container);
  }

  try {
    if (isHydrating()) {
      throw new SeidrError("Hydration is already active");
    }

    // Initialize hydration context
    setHydrationData(hydrationData, container);
    initHydrationContext();

    const unmount = mount(factory, container);
    clearHydrationData();
    return unmount;
  } catch (error) {
    console.warn("Hydration failed, falling back to normal mount", error);
    return mount(factory, container);
  }
};
