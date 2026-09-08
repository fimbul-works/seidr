import { getAppState } from "../app-state/app-state.js";
import { createValue } from "../observable/value.js";
import { DATA_KEY_BROWSER_ROUTER } from "./constants.js";
import { getRouterState } from "./get-router-state.js";
import { history } from "./history.js";
import type { RouterInterface } from "./types.js";

/**
 * Create or get the browser router singleton.
 * @returns {RouterInterface} Router instance
 */
export function browserRouter(): RouterInterface {
  const appState = getAppState();
  if (appState.hasData(DATA_KEY_BROWSER_ROUTER)) {
    return appState.getData<RouterInterface>(DATA_KEY_BROWSER_ROUTER)!;
  }

  const hist = history();
  const url = getRouterState().url;

  const router: RouterInterface = {
    push: (location: string) => hist.push(location),
    replace: (location: string) => hist.replace(location),
    go: (delta: number) => hist.go(delta),
    pathname: url.as((u) => u.pathname),
    searchParams: url.as((u) => Object.fromEntries(u.searchParams)),
    routeParams: createValue<Record<string, string>>({}, { hydrate: false }),
  };

  appState.setData(DATA_KEY_BROWSER_ROUTER, router);
  return router;
}
