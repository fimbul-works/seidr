import { isEmpty } from "../../util/type-guards/primitive-types";
import { hydrationDataStorage } from "./storage";

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns {boolean} true if in hydration mode with data available
 */
export const hasHydrationData = (): boolean => {
  const result = !isEmpty(hydrationDataStorage.data);
  return result;
};

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @param {string} id - The ID of the Seidr to check
 * @returns {boolean} true if in hydration mode with data available
 */
export const hasHydrationDataForSeidr = (id: string): boolean => {
  const result = !isEmpty(hydrationDataStorage.data?.state?.[id]);
  return result;
};
