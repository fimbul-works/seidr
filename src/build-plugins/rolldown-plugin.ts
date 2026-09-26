import type { Plugin } from "rolldown";
import { transformSource } from "./transform.js";

/**
 * Options for Seidr Rolldown plugin.
 */
export interface SeidrRolldownPluginOptions {
  /**
   * The target environment for the build.
   * @default "browser"
   */
  target?: "browser" | "ssr";
  /**
   * Disable server-side rendering support.
   * @default false
   */
  disableSSR?: boolean;
}

/**
 * Seidr Rolldown plugin.
 *
 * @param {SeidrRolldownPluginOptions} options - An object containing options for the plugin
 * @returns {Plugin} Configured Seidr Rolldown plugin
 */
export function seidrRolldownPlugin({
  target = "browser",
  disableSSR = false,
}: SeidrRolldownPluginOptions = {}): Plugin {
  return {
    name: "rolldown:seidr",
    transform(code: string, id: string) {
      // Only transfrom TypeScript and JavaScript sources
      if (!/\.[cm]?[jt]s?$/.test(id)) return null;

      return transformSource(id, code, target, disableSSR);
    },
  };
}
