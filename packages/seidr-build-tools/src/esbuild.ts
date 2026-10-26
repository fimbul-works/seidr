import { unplugin } from "./unplugin.js";

/**
 * Seidr Esbuild plugin.
 */
export const seidrEsbuildPlugin = unplugin.esbuild;
export default seidrEsbuildPlugin;
export type { SeidrEsbuildPluginOptions } from "./types.js";
