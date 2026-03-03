import { hydrationDataStorage } from "./storage";

/**
 * Clears the hydration context.
 * Call this after hydration is complete.
 */
export const clearHydrationData = (): void => {
  hydrationDataStorage.data = undefined;
  hydrationDataStorage.registry.clear();

  if (process.env.VITEST) {
    try {
      const { clearTestAppState } = require("../../test-setup/render-context");
      clearTestAppState?.();
    } catch (_e) {
      // Ignore
    }
  }
};
