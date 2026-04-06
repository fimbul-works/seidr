import { Seidr } from "./seidr/seidr.js";
import { registerSeidrForSSR } from "./ssr/register-seidr.js";

export * from "./index.core.js";
export * from "./util/environment/index.js";

// Add register method for SSR hydration
if (!process.env.DISABLE_SSR) {
  Seidr.register = registerSeidrForSSR;
}
