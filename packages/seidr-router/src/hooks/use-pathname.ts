import type { DerivedValue } from "@fimbul-works/seidr";
import { browserRouter } from "../browser-router.js";
import { initRouter } from "../init-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current path as a derived Value.
 * This cannot be changed directly by the user.
 *
 * @returns {DerivedValue<string>} Derived Value of the current path
 */
export const usePathname = (): DerivedValue<string> => {
  initRouter();
  return (getNearestRouter()?.pathname || browserRouter().pathname).as((pathname) => pathname);
};
