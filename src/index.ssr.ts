import { setAppStateProvider } from "./app-state/app-state.js";
import { getSSRAppState } from "./app-state/app-state.ssr.js";
import { isServer } from "./util/environment/is-server.js";

export { hydrate } from "./ssr/hydrate/hydrate.js";
export { isHydrating } from "./ssr/hydrate/storage.js";
export { renderToString } from "./ssr/render-to-string.js";

// Register SSR state provider
if (isServer()) {
  setAppStateProvider(getSSRAppState);
}
