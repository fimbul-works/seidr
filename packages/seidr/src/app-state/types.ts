/**
 * AppState is used for application state management, SSR and hydration.
 */
export interface AppState {
  /** Application state ID is used to differentiate state between requests */
  ctxID: number;

  /** Application data store */
  data: Map<string, any>;

  /** Data strategies for hydration */
  strategies: Map<string, DataStrategy>;

  /**
   * Check if data exists.
   *
   * @param key - The key to check
   * @returns `true` if data exists, `false` otherwise
   */
  hasData(key: string): boolean;

  /**
   * Get application global data.
   *
   * @param key - The key to get.
   * @param defaultValue - Optional default value to return if data is not found.
   * @returns The data, or `undefined` if not found.
   */
  getData<T>(key: string, defaultValue?: T): typeof defaultValue extends undefined ? T | undefined : T;

  /**
   * Set application global data.
   *
   * @param key - The key to set.
   * @param value - The value to set.
   */
  setData<T>(key: string, value: T): void;

  /**
   * Delete application global data.
   *
   * @param key - The key to delete.
   * @returns `true` if data was deleted, `false` otherwise.
   */
  deleteData(key: string): boolean;

  /**
   * Define a data strategy for hydration, and cleanup after application unmount.
   *
   * @template T - The type of data for hydration.
   * @template I - The type of data from hydration.
   * @param key - The key to define a strategy for.
   * @param captureFn - Function to capture data for hydration.
   * @param restoreFn - Function to restore data from hydration.
   */
  defineDataStrategy<T, I>(key: string, captureFn: CaptureDataFn<T>, restoreFn: RestoreDataFn<I>): void;

  /**
   * Get data strategy for a key.
   *
   * @template T - The type of data for hydration.
   * @param key - The key to get a strategy for.
   * @returns The data strategy, or `undefined` if not found.
   */
  getDataStrategy<T>(key: string): DataStrategy<T> | undefined;

  /**
   * Destroy the application state, and cleanup all resources.
   */
  destroy(): void;
}

/** Function to capture data from AppState for hydration */
export type CaptureDataFn<T> = () => T;

/** Function to restore data to AppState for hydration */
export type RestoreDataFn<T> = (data: T) => void;

/**
 * Data strategy for features and addons, for SSR friendly initialization and hydration.
 *
 * A strategy consists of a capture function, and a restore function.
 */
export type DataStrategy<T = any> = [CaptureDataFn<T>, RestoreDataFn<T>];
