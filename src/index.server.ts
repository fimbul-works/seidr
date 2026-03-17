import { setInternalGetDocument } from "./dom/get-document";
import { getDocument } from "./dom/get-document.server";
import "./app-state/app-state.server";

import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

Seidr.register = registerSeidrForSSR;
setInternalGetDocument(getDocument);

export * from "./index.core";
export * from "./ssr/render-to-string";
export * from "./ssr/hydrate/hydrate";
