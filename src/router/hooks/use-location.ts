import type { Seidr } from "../../seidr/seidr";
import { getCurrentPath } from "../get-current-path";

/**
 * Returns the current path as a derived Seidr.
 * This cannot be changed directly by the user.
 *
 * @returns {Seidr<string>} Derived Seidr of the current path
 */
export const useLocation = (): Seidr<string> => getCurrentPath().as((path) => path);
