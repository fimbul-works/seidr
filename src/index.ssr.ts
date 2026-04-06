import { setAppStateProvider } from "./app-state/app-state";
import { getSSRAppState } from "./app-state/app-state.ssr";

export { initHydrationContext } from "./ssr/hydrate/context/hydration-context";
export { hydrate } from "./ssr/hydrate/hydrate";
export { clearHydrationData, setHydrationData } from "./ssr/hydrate/storage";
export { renderToString } from "./ssr/render-to-string";
export { buildStructureMap } from "./ssr/structure/build-structure-map";
export { escapeAttribute, escapeHTML } from "./ssr/util";

// Register SSR state provider
if (import.meta.env.SSR) {
  setAppStateProvider(getSSRAppState);
}
