import { isClient } from "./is-client.js";

/**
 * Executes a function only in the browser environment.
 * Useful for client-side only side effects like DOM APIs or third-party libraries.
 *
 * @template T
 *
 * @param {() => T} fn - The function to execute purely on the client
 * @returns {T} The result of the function
 */
export const inClient = <T>(fn: () => T): T => (isClient() && fn()) as T;
