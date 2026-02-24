import { hydrationDataStorage } from "./storage";
import type { HydrationData } from "./types";

/**
 * Gets the current hydration data.
 *
 * @returns {HydrationData | undefined}
 */
export const getHydrationData = (): HydrationData | undefined => hydrationDataStorage.data;
