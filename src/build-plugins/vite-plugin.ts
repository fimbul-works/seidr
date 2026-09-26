import type { Plugin, PluginOption } from "vite";
import { transformSource } from "./transform.js";

/**
 * Options for Seidr Vite build plugin.
 */
export interface SeidrVitePluginOptions {
  /**
   * Disable server-side rendering support.
   * @default false
   */
  disableSSR?: boolean;
}

/**
 * Seidr Vite build plugin.
 *
 * @param {SeidrVitePluginOptions} options - An object containing options for the plugin
 * @returns {Plugin} The created plugin
 */
export function seidrVitePlugin({ disableSSR = false }: SeidrVitePluginOptions = {}): Plugin {
  return {
    name: "vite:seidr",
    applyToEnvironment(env) {
      return {
        transform(code: string, id: string) {
          // Only transfrom TypeScript and JavaScript sources
          if (!id.endsWith(".ts") && !id.endsWith(".js")) {
            return null;
          }

          return transformSource(id, code, env.config.consumer === "client" ? "browser" : "ssr", disableSSR);
        },
      } as PluginOption;
    },
  };
}
