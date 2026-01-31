/**
 * Checks if the current environment is SSR (Server-Side Rendering).
 *
 * Returns true if:
 * 1. window is undefined (Node.js environment)
 * 2. SEIDR_TEST_SSR environment variable is set (test environment)
 *
 * @returns {boolean} True if in SSR mode
 */
export const isSSR = (): boolean => {
  return typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);
};

let hydrationFlag = false;

/**
 * Checks if the framework is currently in hydration mode.
 *
 * @returns {boolean} True if hydrating
 */
export const isHydrating = (): boolean => hydrationFlag;

/**
 * Sets the hydration mode flag.
 * @param {boolean} value - Hydration mode status
 */
export const setHydrating = (value: boolean): void => {
  hydrationFlag = value;
};
