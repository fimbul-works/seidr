import { setInternalAppState } from "./app-state/app-state";
import { getSSRAppState } from "./app-state/app-state.server";
import { setInternalGetDocument } from "./dom/get-document";
import { getDocument } from "./dom/get-document.server";

import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

/**
 * Initializes Seidr for server-side use.
 * This performs necessary global registrations and should be called before any other Seidr functions.
 */
export const setupServer = (): void => {
  Seidr.register = registerSeidrForSSR;
  setInternalGetDocument(getDocument);
  setInternalAppState(getSSRAppState);
};

setupServer();

export * from "./index.core";
export * from "./ssr/hydrate/hydrate";
export * from "./ssr/render-to-string";
