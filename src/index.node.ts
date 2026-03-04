import "./dom/get-document.node";
import "./render-context/render-context.node";

import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

Seidr.register = registerSeidrForSSR;

export * from "./index.core";
export * from "./ssr/render-to-string";
