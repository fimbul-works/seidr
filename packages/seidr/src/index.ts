import { setRegisterValueForSSR } from "./observable/register-value-for-ssr.js";
import { registerValueForSSR } from "./ssr/register-value-for-ssr.js";
import { isServer } from "./util/environment/is-server.js";

export * from "./index.core.js";
export { hydrate, isHydrating } from "./ssr/hydrate/index.js";
export * from "./ssr/hydration-serializer.js";
export type { HydrationData } from "./ssr/types.js";
export * from "./util/environment/index.js";

// Register functionality for SSR hydration
if (!isServer()) {
  setRegisterValueForSSR(registerValueForSSR);
}
