import MagicString from "magic-string";
import type { Plugin, PluginOption } from "vite";
import { removeOrphanedImports } from "./remove-orphaned-imports.js";
import { clientOnlyReplacements, clientReplace, serverReplace } from "./replacements.js";
import { transformInEnvironment } from "./transform-in-environment.js";
import { replace } from "./util.js";

/**
 * Options for Seidr build plugin.
 */
export interface SeidrPluginOptions {
  /**
   * Disable server-side rendering support.
   * @default false
   */
  disableSSR?: boolean;
}

/**
 * Seidr Vite app plugin.
 *
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
