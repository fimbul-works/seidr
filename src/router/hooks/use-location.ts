import { weave } from "../../observable";
import { NO_HYDRATE } from "../../observable/constants";
import { isClient } from "../../util/environment/client";
import { getCurrentPath } from "../get-current-path";
import { parseURL } from "./util";

const LOCATION_SEIDR_ID = "router-location";

export interface Location {
  location: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
}

/**
 * Returns the current location object.
 * @returns {URL} The current location object
 */
export const useLocation = (overridePath?: string) => {
  // Get the current path state
  const currentPathState = getCurrentPath();
  // If an override path is provided, set it
  if (overridePath) {
    currentPathState.value = overridePath;
  }

  window.onpopstate = (event) => {
    console.log(`location: ${document.location}, state: ${JSON.stringify(event.state)}`);
    console.log(parseURL(window.location.href));
  };

  // Create a weave for the location
  // const url = new URL(currentPathState.value, isClient() ? window.location.origin : "/");
  currentPathState.as((url) => new URL(url, isClient() ? window.location.origin : "http://fimbul.works/"));

  const location = weave(parseURL(currentPathState.value), { id: LOCATION_SEIDR_ID, ...NO_HYDRATE });
  // location.observe(() => console.log("location changed", location.href));
  currentPathState.bind(location, (url, loc) => Object.assign(loc, parseURL(url)));

  return location;
};
