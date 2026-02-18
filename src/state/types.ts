/**
 * Error callback type for useStorage error handling.
 *
 * @param {Error} error - The error that occurred
 * @param {StorageOperation} operation - The type of storage operation that failed ('read' or 'write')
 */
export type StorageErrorHandler = (error: Error, operation: StorageOperation) => void;

/**
 * Type-safe state key that carries its type
 *
 * @template T - State type
 */
export type StateKey<T> = symbol & { readonly __type?: T };

// Extract generic from instance
export type InferStateType<C> = C extends StateKey<infer T> ? T : never;

/** Storage type constants */
export const STORAGE_SESSION = "session";
export const STORAGE_LOCAL = "local";

/** Storage type */
export type StorageType = typeof STORAGE_SESSION | typeof STORAGE_LOCAL;

/** Options for identifying and configuring state */
export interface StateOptions {
  /** Storage type to persist state */
  storage?: StorageType;
  /** Error handler for storage operations */
  onStorageError?: StorageErrorHandler;
}

/** Storage operation type */
export type StorageOperation = "read" | "write";
