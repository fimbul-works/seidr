import { hydrationDataStorage } from "./storage";
import type { HydrationData } from "./types";

/**
 * Gets the current hydration data.
 *
 * @returns {HydrationData | undefined}
 */
export function getHydrationData(): HydrationData | undefined {
  return hydrationDataStorage.data;
}
