/**
 * Interface for the test environment state.
 */
export interface TestEnvironmentState {
  /**
   * The SSR mode of the test environment.
   */
  seidrSSR?: string;
  /**
   * The import.meta.env.SSR value of the test environment.
   */
  importMetaEnvSSR?: boolean;
  /**
   * The window object of the test environment.
   */
  window: any;
}
