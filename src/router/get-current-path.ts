import { getAppState } from "../app-state/app-state";
import { getRootComponent } from "../component/get-root-component";
import { noHydrate } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { isServer } from "../util/environment/is-server";
import { PATH_DATA_KEY, PATH_SEIDR_ID } from "./constants";

/** Clear cached path from appState */
export const clearPathCache = () => {
  const state = getAppState();
  const observable = state.getData<Seidr<string>>(PATH_DATA_KEY);
  if (observable) {
    observable.destroy();
    state.deleteData(PATH_DATA_KEY);
  }
};

/**
 * Get the reactive current path observable.
 *
 * @returns {Seidr<string>} Reactive current path observable
 */
export const getCurrentPath = (): Seidr<string> => {
  const state = getAppState();
  let observable = state.getData<Seidr<string>>(PATH_DATA_KEY);

  if (!observable) {
    const initialPath = isServer()
      ? (state.getData<string>(PATH_DATA_KEY) ?? "/")
      : window.location
        ? window.location.pathname + window.location.search + window.location.hash
        : "/";

    observable = new Seidr<string>(initialPath, { ...noHydrate, id: PATH_SEIDR_ID });
    state.setData(PATH_DATA_KEY, observable);

    if (!isServer() && typeof window !== "undefined") {
      // Handle history.back
      const popStateHandler = () =>
        (observable!.value = window.location.pathname + window.location.search + window.location.hash);
      window.addEventListener("popstate", popStateHandler);

      getRootComponent()?.onUnmount(() => {
        window.removeEventListener("popstate", popStateHandler);
        clearPathCache();
      });
    }
  }

  return observable;
};
