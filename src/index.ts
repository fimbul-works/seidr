import { Seidr } from "./seidr/seidr.js";
import { registerSeidrForSSR } from "./ssr/register-seidr-for-ssr.js";

export * from "./index.core.js";
export { hydrate, isHydrating } from "./ssr/hydrate/index.js";
export type { HydrationData } from "./ssr/types.js";
export * from "./util/environment/index.js";

// Register functionality for SSR hydration
Seidr.register = registerSeidrForSSR;
