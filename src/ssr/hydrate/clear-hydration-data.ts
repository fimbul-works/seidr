import { hydrationDataStorage } from "./storage";

/**
 * Clears the hydration context.
 * Call this after hydration is complete.
 */
export const clearHydrationData = (): void => {
  hydrationDataStorage.data = undefined;
  hydrationDataStorage.registry.clear();
};
