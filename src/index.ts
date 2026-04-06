import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";

export * from "./app-state/index";
export * from "./component/index";
export * from "./components/index";
export * from "./constants";
export * from "./dom/index";
export * from "./element/index";
export * from "./elements/index";
export * from "./form/index";
export * from "./seidr/index";
export * from "./types";
export * from "./util/index";

// Register SSR state provider
if (process.env.DISABLE_SSR) {
  Seidr.register = registerSeidrForSSR;
}
