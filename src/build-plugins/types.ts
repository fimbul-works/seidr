/**
 * Options for Seidr build plugin.
 */
export interface SeidrBuildPluginOptions {
  /**
   * Disable server-side rendering support.
   * @default false
   */
  disableSSR?: boolean;

  /**
   * The target environment for the build.
   * @default "neutral"
   */
  target?: "neutral" | "browser" | "ssr";
}
