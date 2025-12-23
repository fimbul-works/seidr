/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param data - Data to handle
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for cleanup functions used throughout Seidr for resource management.
 *
 * Cleanup functions are returned by various Seidr APIs to allow for proper
 * resource cleanup and memory management when subscriptions, bindings, or
 * components are no longer needed.
 */
export type CleanupFunction = () => void;

/**
 * Type for a Map key.
 */
export type MapKey = string | number | symbol;
