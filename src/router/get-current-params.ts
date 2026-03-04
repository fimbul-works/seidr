import { getAppState } from "../app-state/app-state";
import { NO_HYDRATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { PARAMS_DATA_KEY, PARAMS_SEIDR_ID } from "./constants";

/** Clear cached params from appState */
export const clearParamsCache = () => {
  const state = getAppState();
  const observable = state.getData<Seidr<Record<string, string>>>(PARAMS_DATA_KEY);
  if (observable) {
    observable.destroy();
    state.deleteData(PARAMS_DATA_KEY);
  }
};

/** Reset client-side params state (for testing) */
export const resetClientParamsState = clearParamsCache;

/**
 * Get the reactive current params observable.
 *
 * @returns {Seidr<Record<string, string>>} Reactive current params observable
 */
export const getCurrentParams = (): Seidr<Record<string, string>> => {
  const state = getAppState();
  let observable = state.getData<Seidr<Record<string, string>>>(PARAMS_DATA_KEY);

  if (!observable) {
    observable = new Seidr<Record<string, string>>({}, { ...NO_HYDRATE, id: PARAMS_SEIDR_ID });
    state.setData(PARAMS_DATA_KEY, observable);
  }

  return observable;
};
