import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

Seidr.register = registerSeidrForSSR;

export * from "./index.core";
export * from "./ssr/hydrate/hydrate";
