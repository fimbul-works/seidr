/**
 * Target execution environment for Seidr builds.
 */
export type SeidrBuildTarget = "browser" | "ssr";

/**
 * Options for Seidr build plugins across all supported build tools.
 */
export interface SeidrBuildPluginOptions {
  /**
   * Disable server-side rendering support.
   * When true, strips all SSR tracking and hydration code for maximum client-only size optimization.
   * @default false
   */
  disableSSR?: boolean;

  /**
   * The target environment for the build.
   * @default "browser"
   */
  target?: SeidrBuildTarget;

  /**
   * Filter patterns for files to include.
   */
  include?: string | RegExp | Array<string | RegExp>;

  /**
   * Filter patterns for files to exclude.
   */
  exclude?: string | RegExp | Array<string | RegExp>;
}

export type SeidrVitePluginOptions = SeidrBuildPluginOptions;
export type SeidrRolldownPluginOptions = SeidrBuildPluginOptions;
export type SeidrWebpackPluginOptions = SeidrBuildPluginOptions;
export type SeidrRollupPluginOptions = SeidrBuildPluginOptions;
export type SeidrEsbuildPluginOptions = SeidrBuildPluginOptions;
export type SeidrRspackPluginOptions = SeidrBuildPluginOptions;
export type SeidrBabelPluginOptions = SeidrBuildPluginOptions;
