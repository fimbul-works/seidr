import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

export * from "./app-state";
export * from "./component";
export * from "./components";
export * from "./dom";
export * from "./element";
export * from "./elements";
export * from "./form";
export * from "./seidr";
export * from "./types";
export * from "./util";

// Add register method for SSR hydration
if (!process.env.DISABLE_SSR) {
  Seidr.register = registerSeidrForSSR;
}
