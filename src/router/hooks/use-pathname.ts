import type { Value } from "../../observable/value.js";
import { browserRouter } from "../browser-router.js";
import { initRouter } from "../init-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current path as a derived Value.
 * This cannot be changed directly by the user.
 *
 * @returns {Value<string>} Derived Value of the current path
 */
export const usePathname = (): Value<string> => {
  initRouter();
  return (getNearestRouter()?.pathname || browserRouter().pathname).as((pathname) => pathname);
};
