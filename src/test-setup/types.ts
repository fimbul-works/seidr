/**
 * Interface for the test environment state.
 */
export interface TestEnvironmentState {
  /**
   * The SSR mode of the test environment.
   */
  seidrSSR?: string;
  /**
   * The process.env.SSR value of the test environment.
   */
  importMetaEnvSSR?: string;
  /**
   * The window object of the test environment.
   */
  window: any;
}
