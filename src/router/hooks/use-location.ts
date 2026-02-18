import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { parseURL } from "./util";

export interface Location {
  href: string;
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
 * Returns the current location snapshot.
 * To make properties reactive, use location.pathSignal or location.paramsSignal.
 */
export const useLocation = (overridePath?: string) => {
  const currentPathState = getCurrentPath();
  const currentParamsState = getCurrentParams();

  if (overridePath) {
    currentPathState.value = overridePath;
  }

  const urlData = parseURL(currentPathState.value);

  return {
    ...urlData,
    params: currentParamsState.value,
    pathSignal: currentPathState,
    paramsSignal: currentParamsState,
  };
};
