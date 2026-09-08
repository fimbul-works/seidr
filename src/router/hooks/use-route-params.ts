import type { Value } from "../../observable/value.js";
import { browserRouter } from "../browser-router.js";
import { initRouter } from "../init-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current route parameters as a derived Value.
 *
 * @returns {Value<Record<string, string>>} Derived Value of the current route parameters
 */
export const useRouteParams = (): Value<Record<string, string>> => {
  initRouter();
  return (getNearestRouter()?.routerParams || browserRouter().routeParams).as((params) => params);
};

/**
 * Alias for useRouteParams.
 */
export const useRouterParams = useRouteParams;
