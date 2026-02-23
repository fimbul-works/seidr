/**
 * Interface for the test environment state.
 */
export interface TestEnvironmentState {
  /**
   * The SSR mode of the test environment.
   */
  seidrSSR?: string;
  /**
   * Whether the test environment is Vitest.
   */
  vitest?: boolean;
  /**
   * The window object of the test environment.
   */
  window: any;
  /**
   * The DOM factory of the test environment.
   */
  getDocument?: () => Document;
}
