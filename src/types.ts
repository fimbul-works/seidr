/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param {T} data - Data to handle
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for error handlers.
 *
 * @template {Error} T - The error type
 * @param {T} error - Error to handle
 */
export type ErrorHandler<T extends Error = Error> = (error: T) => void;

/**
 * Type for cleanup functions.
 */
export type CleanupFunction = () => void;

/**
 * Type for a Map key.
 */
export type MapKey = string | number | symbol;
