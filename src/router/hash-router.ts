import { getAppState } from "../app-state/app-state.js";
import { createValue } from "../observable/value.js";
import { DATA_KEY_HASH_ROUTER } from "./constants.js";
import { getRouterState } from "./get-router-state.js";
import { history } from "./history.js";
import type { RouterInterface } from "./types.js";

/**
 * Create or get the hash router singleton.
 * @returns {RouterInterface} Router instance
 */
export function hashRouter(): RouterInterface {
  const appState = getAppState();
  if (appState.hasData(DATA_KEY_HASH_ROUTER)) {
    return appState.getData<RouterInterface>(DATA_KEY_HASH_ROUTER)!;
  }

  const hist = history();
  const url = getRouterState().url;

  /**
   * Parse pathname from URL hash.
   */
  const parsePathname = (hash: string) => {
    const h = hash.startsWith("#") ? hash.slice(1) : hash;
    const path = h.split("?")[0];
    return path.startsWith("/") ? path : `/${path}`;
  };

  /**
   * Parse search params from URL hash.
   */
  const parseSearchParams = (hash: string) => {
    const h = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!h.includes("?")) {
      return {};
    }
    return Object.fromEntries(new URLSearchParams(h.split("?")[1]));
  };

  const router: RouterInterface = {
    push: (location: string) => hist.push(`#${location.startsWith("/") ? location : `/${location}`}`),
    replace: (location: string) => hist.replace(`#${location.startsWith("/") ? location : `/${location}`}`),
    go: (delta: number) => hist.go(delta),
    pathname: url.as((u) => parsePathname(u.hash)),
    searchParams: url.as((u) => parseSearchParams(u.hash)),
    routeParams: createValue<Record<string, string>>({}, { hydrate: false }),
  };

  appState.setData(DATA_KEY_HASH_ROUTER, router);
  return router;
}
