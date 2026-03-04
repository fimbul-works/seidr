import "./dom/get-document.node";
import "./app-state/app-state.node";

import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

Seidr.register = registerSeidrForSSR;

export * from "./index.core";
export * from "./ssr/render-to-string";
