import type { SeidrComponentFactoryOrFunction } from "../../component/types.js";
import { mount } from "../../dom/mount.js";
import { type CleanupFunction, SeidrError } from "../../types.js";
import { isNullish } from "../../util/type-guards.js";
import type { HydrationData } from "../types.js";
import { clearHydrationContext, initHydrationContext } from "./hydration-context.js";
import { clearHydrationData, initHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrates a component with previously captured SSR hydration data.
 * Claims existing DOM nodes in container and binds reactive state.
 *
 * @param {SeidrComponentFactoryOrFunction} factory - Component to hydrate
 * @param {HTMLElement} container - The HTMLElement containing server-rendered markup
 * @param {HydrationData} hydrationData - The previously captured hydration data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when called during an active hydration pass
 * @throws {SeidrError} if hydration payload is missing required fields
 */
export function hydrate(
  factory: SeidrComponentFactoryOrFunction,
  container: HTMLElement,
  hydrationData: HydrationData,
): CleanupFunction {
  if (isHydrating()) {
    throw new SeidrError("Hydration is already active");
  }

  if (
    isNullish(hydrationData) ||
    isNullish(hydrationData.ctxID) ||
    isNullish(hydrationData.data) ||
    isNullish(hydrationData.components)
  ) {
    throw new SeidrError("Invalid hydration data");
  }

  // Initialize hydration data and context
  initHydrationData(hydrationData);
  initHydrationContext(container);

  try {
    const cleanup = mount(factory, container);
    return cleanup;
  } finally {
    clearHydrationData();
    clearHydrationContext();
  }
}
