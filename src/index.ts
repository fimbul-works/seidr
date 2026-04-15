import { Seidr } from "./seidr/seidr.js";
import { registerSeidrForSSR } from "./ssr/register-seidr.js";

export * from "./index.core.js";
export * from "./util/environment/index.js";

// Register functionality for SSR hydration
Seidr.register = registerSeidrForSSR;
