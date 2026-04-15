import type { CleanupFunction } from "../types";

/**
 * Global type declaration for the application state provider.
 */
declare global {
  var __SEIDR_APP_STATE_PROVIDER__: (() => AppState) | undefined;
}

/** Function to capture data from AppState for hydration */
export type CaptureDataFn<T> = () => T;

/** Function to restore data to AppState for hydration */
export type RestoreDataFn<T> = (data: T) => void;

/**
 * AppState is used for application state management, SSR and hydration.
 */
export interface AppState {
  /** Application state ID is used to differentiate state between requests */
  ctxID: number;

  /** Counter for generating unique IDs */
  seidrIdCounter: number;

  /** Cache for marker comments indexed by component ID */
  markers: Map<string, [Comment, Comment]>;

  /** Application data store */
  data: Map<string, any>;

  /** Data strategies for hydration */
  strategies: Map<string, [CaptureDataFn<any>, RestoreDataFn<any>, CleanupFunction | undefined]>;

  /**
   * Whether the current state is for SSR.
   * Used for testing.
   * @internal
   */
  isSSR?: boolean;

  /**
   * Check if data exists.
   *
   * @param {string} key - The key to check
   * @returns {boolean} True if data exists, false otherwise
   */
  hasData(key: string): boolean;

  /**
   * Get data.
   *
   * @param {string} key - The key to get
   * @returns {T | undefined} The data, or undefined if not found
   */
  getData<T>(key: string): T | undefined;

  /**
   * Set data.
   *
   * @param {string} key - The key to set
   * @param {T} value - The value to set
   */
  setData<T>(key: string, value: T): void;

  /**
   * Delete data.
   *
   * @param {string} key - The key to delete
   * @returns {boolean} True if data was deleted, false otherwise
   */
  deleteData(key: string): boolean;

  /**
   * Define a data strategy for hydration.
   *
   * @template T - The type of data for hydration
   * @param {string} key - The key to define a strategy for
   * @param {CaptureDataFn<T>} captureFn - Function to capture data for hydration
   * @param {RestoreDataFn<T>} restoreFn - Function to restore data for hydration
   * @param {CleanupFunction} [cleanupFn] - Function to clean up data for hydration
   */
  defineDataStrategy<T>(
    key: string,
    captureFn: CaptureDataFn<T>,
    restoreFn: RestoreDataFn<T>,
    cleanupFn?: CleanupFunction,
  ): void;

  /**
   * Get data strategy for a key.
   *
   * @template T - The type of data for hydration
   * @param {string} key - The key to get a strategy for
   * @returns {[CaptureDataFn<T>, RestoreDataFn<T>, CleanupFunction | undefined] | undefined} The data strategy, or undefined if not found
   */
  getDataStrategy<T>(key: string): [CaptureDataFn<T>, RestoreDataFn<T>, CleanupFunction | undefined] | undefined;

  /**
   * Destroy the application state.
   */
  destroy(): void;
}
