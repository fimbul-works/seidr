import { unplugin } from "./unplugin.js";

/**
 * Seidr Webpack plugin.
 */
export const seidrWebpackPlugin = unplugin.webpack;
export default seidrWebpackPlugin;
export type { SeidrWebpackPluginOptions } from "./types.js";
