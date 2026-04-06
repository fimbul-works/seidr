import { setAppStateProvider } from "./app-state/app-state";
import { getSSRAppState } from "./app-state/app-state.ssr";
import { isServer } from "./util";

export { hydrate } from "./ssr/hydrate/hydrate";
export { renderToString } from "./ssr/render-to-string";

// Register SSR state provider
if (isServer()) {
  setAppStateProvider(getSSRAppState);
}
