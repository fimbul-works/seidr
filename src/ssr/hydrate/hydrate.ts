import type { ComponentType } from "../../component/types.js";
import { mount } from "../../dom/mount.js";
import { type CleanupFunction, SeidrError } from "../../types.js";
import { isEmpty } from "../../util/type-guards/primitive-types.js";
import type { HydrationData } from "../types.js";
import { clearHydrationContext, initHydrationContext } from "./hydration-context.js";
import { clearHydrationData, initHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * @template {ComponentType} T - The type of the component, which can be a factory or a component instance
 * @param {T} factory - The component or factory to hydrate
 * @param {HTMLElement} container - The HTMLElement to mount the hydrated component into
 * @param {HydrationData} hydrationData - The previously captured hydration data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when called during an active hydration pass
 * @throws {SeidrError} if hydration payload is missing required fields
 */
export function hydrate<T extends ComponentType>(
  factory: T,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction {
  if (isHydrating()) {
    throw new SeidrError("Hydration is already active");
  }

  if (isEmpty(hydrationData.ctxID) || isEmpty(hydrationData.components) || isEmpty(hydrationData.data)) {
    throw new SeidrError("Invalid hydration data");
  }

  // Initialize hydration context
  initHydrationData(hydrationData);
  initHydrationContext(container);

  const unmount = mount(factory, container);

  clearHydrationData();
  clearHydrationContext();

  return unmount;
}
