import { NO_HYDRATE } from "../../observable/constants";
import type { Seidr } from "../../observable/seidr";
import { useState } from "../../state/use-state";

export const getRouteParams = (): Seidr<Record<string, string>> => {
  return useState("router-params", {}, { ...NO_HYDRATE });
};

export const useParams = (): Seidr<Record<string, string>> => {
  const params = getRouteParams();
  return params;
};
