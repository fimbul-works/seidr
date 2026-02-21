import type { Seidr } from "../../seidr/seidr";
import { getCurrentParams } from "../get-current-params";

/**
 * Returns a derived Seidr of the parsed parameters for the current route.
 * If the route has no parameters, it returns an empty object.
 *
 * @returns {Seidr<Record<string, string>>} Derived Seidr of the current route parameters
 */
export const useParams = (): Seidr<Record<string, string>> => getCurrentParams().as((params) => ({ ...params }));
