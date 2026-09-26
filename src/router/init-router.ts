import { getAppState } from "../app-state/app-state.js";
import { getComponentScope } from "../component/component-scope.js";
import { isValue } from "../observable/type-guards.js";
import { createValue } from "../observable/value.js";
import { SeidrError } from "../types.js";
import { isClient } from "../util/environment/is-client.js";
import { isNullish, isObj, isStr } from "../util/type-guards.js";
import { browserRouter } from "./browser-router.js";
import { DATA_KEY_ROUTER, DUMMY_BASE_URL, VALUE_ID_ROUTER_URL } from "./constants.js";
import type { PopstateListener, RouterState, RouterTreeNode } from "./types.js";

/**
 * Initialize the router state.
 *
 * @param {string | URL | Location} [initialUrl] - Initial URL for the router (default: current window location pathname or "/")
 * @param {string} [base=DUMMY_BASE_URL] - Base URL for resolving relative URLs, default `DUMMY_BASE_URL`
 */
export const initRouter = (
  initialUrl?: string | URL | Location,
  base: string = isClient() ? window.location.href : DUMMY_BASE_URL,
) => {
  /**
   * Normalize the initial URL input to a URL object.
   * @param {string | URL | Location} url
   * @returns {URL} Normalized URL object
   * @throws {SeidrError} If the input URL is invalid
   */
  const getUrlObject = (url: string | URL | Location): URL => {
    if (url instanceof URL) {
      return url;
    }

    if (isStr(url)) {
      return new URL(url, base);
    }

    if (isClient() && url instanceof Location) {
      return new URL(url.href, base);
    }

    throw new SeidrError("Invalid URL provided to initRouter");
  };

  const appState = getAppState();
  const existing = appState.getData<string | RouterState>(DATA_KEY_ROUTER);

  // Check if router has already been initialized
  if (isObj<RouterState>(existing) && existing.tree instanceof Map && isValue(existing.url)) {
    if (!isNullish(initialUrl)) {
      existing.url(getUrlObject(initialUrl));
    }
    return;
  }

  // Use URL from AppState if no explicit initialUrl was passed
  if (isNullish(initialUrl) && isStr(existing)) {
    initialUrl = existing;
  }

  // Fallback to default if not provided
  if (isNullish(initialUrl)) {
    initialUrl = isClient() ? window.location.pathname : "/";
  }

  const url = createValue<URL>(getUrlObject(initialUrl), { id: VALUE_ID_ROUTER_URL, hydrate: false });
  const popstateListeners = new Set<PopstateListener>();

  // Define event handlers for URL changes
  const popstate = () => url(new URL(window.location.href, base));

  // Setup event listeners for client-side navigation
  if (isClient()) {
    window.addEventListener("popstate", popstate);
  }

  // Observe URL changes and notify listeners
  const cleanup = url.watch((newUrl) => popstateListeners.forEach((fn) => fn(newUrl.pathname + newUrl.search)));

  // Cleanup on unmount if in component scope
  const currentScope = getComponentScope();
  if (currentScope) {
    currentScope.onUnmounted(cleanup);
  }

  // Define data strategy for hydration
  if (!process.env.SEIDR_DISABLE_SSR) {
    appState.defineDataStrategy<string, string>(
      DATA_KEY_ROUTER,
      // Capture function: store current URL and other serializable state
      () => url().href,
      // Restore function: restore URL from captured data
      (urlStr: string) => url(new URL(urlStr, base)),
    );
  }

  // Store state in AppState
  appState.setData<RouterState>(DATA_KEY_ROUTER, {
    url,
    tree: new Map<number, RouterTreeNode>(),
    parentMap: new Map<number, RouterTreeNode | null>(),
    popstateListeners,
  });

  // Eagerly initialize the browser router singleton
  browserRouter();
};
