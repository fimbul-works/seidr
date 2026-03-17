import { setInternalAppState } from "./app-state/app-state";
import { appState } from "./app-state/storage";
import { setInternalGetDocument } from "./dom/get-document";
import { getDocument as getBrowserDocument } from "./dom/get-document.client";
import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

/**
 * Initializes Seidr for client-side use.
 * This performs necessary global registrations and should be called before any other Seidr functions.
 */
export const setupClient = (): void => {
  Seidr.register = registerSeidrForSSR;
  setInternalAppState(() => appState);
  setInternalGetDocument(getBrowserDocument);
};

export * from "./index.core";
export * from "./ssr/hydrate/hydrate";
