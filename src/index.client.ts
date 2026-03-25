import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

export * from "./index.core";
export * from "./ssr/hydrate/hydrate";

Seidr.register = registerSeidrForSSR;
