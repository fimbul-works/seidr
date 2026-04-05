/**
 * Global type declaration for the application state provider.
 */
declare global {
  var __SEIDR_APP_STATE_PROVIDER__: (() => AppState) | undefined;
  var __SEIDR_APP_STATE_STRATEGIES__: Map<string, [CaptureDataFn, RestoreDataFn]> | undefined;
}

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

  /** Whether the current state is for SSR */
  isSSR?: boolean;

  /**
   * Check if data exists
   * @param {string} key - The key to check
   * @returns {boolean} True if data exists, false otherwise
   */
  hasData(key: string): boolean;

  /**
   * Get data
   * @param {string} key - The key to get
   * @returns {T | undefined} The data, or undefined if not found
   */
  getData<T>(key: string): T | undefined;

  /**
   * Set data
   * @param {string} key - The key to set
   * @param {T} value - The value to set
   */
  setData<T>(key: string, value: T): void;

  /**
   * Delete data
   * @param {string} key - The key to delete
   * @returns {boolean} True if data was deleted, false otherwise
   */
  deleteData(key: string): boolean;

  /**
   * Define a data strategy for hydration
   * @param {string} key - The key to define a strategy for
   * @param {CaptureDataFn} captureFn - Function to capture data for hydration
   * @param {RestoreDataFn} restoreFn - Function to restore data for hydration
   */
  defineDataStrategy(key: string, captureFn: CaptureDataFn, restoreFn: RestoreDataFn): void;

  /**
   * Get data strategy for a key
   * @param {string} key - The key to get a strategy for
   * @returns {[CaptureDataFn, RestoreDataFn] | undefined} The data strategy, or undefined if not found
   */
  getDataStrategy(key: string): [CaptureDataFn, RestoreDataFn] | undefined;
}

/** Function to capture data for hydration */
export type CaptureDataFn = (value: any) => any;

/** Function to restore data for hydration */
export type RestoreDataFn = (value: any) => any;
