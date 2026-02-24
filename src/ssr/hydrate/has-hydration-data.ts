import { isEmpty } from "../../util/type-guards/primitive-types";
import { hydrationDataStorage } from "./storage";

/**
 * Checks if hydration is currently active for the current render context.
 *
 * @returns {boolean} true if in hydration mode with data available
 */
export const hasHydrationData = (): boolean => !isEmpty(hydrationDataStorage.data);
