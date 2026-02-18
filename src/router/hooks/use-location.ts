import { NO_HYDRATE } from "../../seidr/constants";
import { weave } from "../../seidr/seidr-weave";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { parseURL } from "./util";

const LOCATION_SEIDR_ID = "router-location";

export interface Location {
  location: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  origin: string;
  hostname: string;
  port: string;
  protocol: string;
}

/**
 * Returns the current location object.
 * @returns {Location} The current location object
 */
export const useLocation = (overridePath?: string) => {
  // Get the current path state
  const currentPathState = getCurrentPath();
  const currentParamsState = getCurrentParams();

  // If an override path is provided, set it
  if (overridePath) {
    currentPathState.value = overridePath;
  }

  // Create a weave for the location
  const location = weave(
    { ...parseURL(currentPathState.value), params: currentParamsState.value },
    { id: LOCATION_SEIDR_ID, ...NO_HYDRATE },
  );

  currentPathState.bind(location, (url, loc) => Object.assign(loc, parseURL(url)));
  currentParamsState.bind(location, (params, loc) => Object.assign(loc, { params }));

  return location;
};
