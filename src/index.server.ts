import { setAppStateProvider } from "./app-state/app-state";
import { getSSRAppState } from "./app-state/app-state.server";
import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

export * from "./index.core";
export * from "./ssr/render-to-string";

Seidr.register = registerSeidrForSSR;
setAppStateProvider(getSSRAppState);
