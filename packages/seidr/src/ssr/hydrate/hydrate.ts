import type { SeidrComponentFactoryOrFunction } from "../../component/types.js";
import { mount } from "../../dom/mount.js";
import { type CleanupFunction, SeidrError } from "../../types.js";
import { isNullish } from "../../util/type-guards.js";
import { getHydrationSerializer } from "../hydration-serializer.js";
import type { HydrationData } from "../types.js";
import { clearHydrationContext, initHydrationContext } from "./hydration-context.js";
import { clearHydrationData, initHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrates a component with previously captured SSR hydration data.
 * Claims existing DOM nodes in container and binds reactive state.
 *
 * @param {SeidrComponentFactoryOrFunction} factory - Component to hydrate
 * @param {HTMLElement} container - The HTMLElement containing server-rendered markup
 * @param {HydrationData | string} hydrationData - The previously captured hydration data (object or serialized string)
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when called during an active hydration pass
 * @throws {SeidrError} if hydration payload is missing required fields
 */
export function hydrate(
  factory: SeidrComponentFactoryOrFunction,
  container: HTMLElement,
  hydrationData: HydrationData | string,
): CleanupFunction {
  if (isHydrating()) {
    throw new SeidrError("Hydration is already active");
  }

  const resolvedData: HydrationData =
    typeof hydrationData === "string"
      ? (getHydrationSerializer().parse(hydrationData) as HydrationData)
      : hydrationData;

  if (
    isNullish(resolvedData) ||
    isNullish(resolvedData.ctxID) ||
    isNullish(resolvedData.data) ||
    isNullish(resolvedData.components)
  ) {
    throw new SeidrError("Invalid hydration data");
  }

  // Initialize hydration data and context
  initHydrationData(resolvedData);
  initHydrationContext(container);

  try {
    const cleanup = mount(factory, container);
    return cleanup;
  } finally {
    clearHydrationData();
    clearHydrationContext();
  }
}
