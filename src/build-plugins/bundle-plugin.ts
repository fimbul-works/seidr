import MagicString from "magic-string";
import type { Plugin } from "rolldown";
import { clientOnlyReplacements, clientReplace } from "./config.js";
import type { SeidrPluginOptions } from "./types.js";
import { replace } from "./util.js";

export const seidrBundlePlugin = ({ disableSSR = false }: SeidrPluginOptions): Plugin => ({
  name: "rolldown:seidr-bundle",
  transform(code: string, id: string) {
    // Only process JavaScript and TypeScript files
    if (!id.endsWith(".ts") && !id.endsWith(".js")) {
      return null;
    }

    const ms = new MagicString(code);
    replace(ms, disableSSR ? clientOnlyReplacements : clientReplace);

    return {
      code: ms.toString(),
      map: ms.generateMap({ hires: true }),
    };
  },
});
