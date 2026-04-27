import MagicString from "magic-string";
import type { Plugin, PluginOption } from "vite";
import { clientOnlyReplacements, clientReplace, serverReplace } from "./config.js";
import { removeOrphanedImports } from "./remove-orphaned-imports.js";
import { transformInEnvironment } from "./transform-in-environment.js";
import type { SeidrPluginOptions } from "./types.js";
import { replace } from "./util.js";

export { seidrBundlePlugin } from "./bundle-plugin.js";

/**
 * Seidr Vite app plugin.
 * @param {SeidrBuildPluginOptions} options - An object containing options for the plugin
 * @returns {Plugin} The created plugin
 */
export function seidr({ disableSSR = false }: SeidrPluginOptions = {}): Plugin {
  return {
    name: "vite:seidr",
    applyToEnvironment(env) {
      return {
        transform(code: string, id: string) {
          // Only transfrom TypeScript and JavaScript sources
          if (!id.endsWith(".ts") && !id.endsWith(".js")) {
            return null;
          }

          const ms = new MagicString(code);

          // Transform source for environment
          const isClient = env.config.consumer === "client";
          transformInEnvironment(ms, id, disableSSR || isClient);

          // Remove orphaned imports
          removeOrphanedImports(ms, id);

          // Apply string replacements based on the provided options
          replace(ms, disableSSR ? clientOnlyReplacements : isClient ? clientReplace : serverReplace);

          return {
            code: ms.toString(),
            map: ms.generateMap({ hires: true }),
          };
        },
      } as PluginOption;
    },
  };
}

export default seidr;
