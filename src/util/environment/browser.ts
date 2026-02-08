/**
 * Returns true if the current environment is the browser.
 *
 * @returns {boolean} `true` if in browser, `false` otherwise
 */
export const isClient = (): boolean => typeof window !== "undefined" && !process.env.SEIDR_TEST_SSR;

/**
 * Executes a function only in the browser environment.
 * Useful for client-side only side effects like DOM APIs or third-party libraries.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the client
 * @returns {T | false} The result of the function, or false if on the server
 */
export const inClient = <T>(fn: () => T): T | false => isClient() && fn();
