import { getAppState } from "../app-state/get-app-state.js";
import { createValue } from "../observable/value.js";
import type { Value } from "../observable/types.js";
import { isClient } from "../util/environment/is-client.js";
import { DATA_KEY_CURRENT_URL } from "./constants.js";

/**
 * Gets the reactive Observable Value containing the current application URL.
 * Automatically synchronizes with window.popstate in client environments.
 *
 * @returns {Value<URL>} Observable Value holding the current URL
 */
export const getCurrentUrl = (): Value<URL> => {
  const appState = getAppState();
  let url = appState.getData<Value<URL>>(DATA_KEY_CURRENT_URL);

  if (!url) {
    const initialHref =
      isClient() && window.location.href !== "about:blank" ? window.location.href : "http://localhost/";
    url = createValue<URL>(new URL(initialHref), { id: DATA_KEY_CURRENT_URL });
    appState.setData(DATA_KEY_CURRENT_URL, url);

    if (isClient()) {
      const onPopState = () => {
        url(new URL(window.location.href));
      };
      window.addEventListener("popstate", onPopState);
      url.cleanup(() => {
        window.removeEventListener("popstate", onPopState);
      });
    }
  }

  return url;
};

/**
 * Updates the current application URL.
 *
 * @param {URL | string} target - Next URL or path string
 */
export const setCurrentUrl = (target: URL | string): void => {
  const current = getCurrentUrl();
  const next = target instanceof URL ? target : new URL(target, current().href);
  current(next);
};

