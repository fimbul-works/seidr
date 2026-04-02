/**
 * AppState is used for application state management, SSR and hydration.
 */
export interface AppState {
  /** Application state ID is used to differentiate state between requests */
  ctxID: number;

  /** Counter for generating unique IDs */
  cid: number;

  /** Cache for marker comments indexed by component ID */
  markers: Map<string, [Comment, Comment]>;

  /** Application data store */
  data: Map<string, any>;

  // Data accessors
  hasData(key: string): boolean;
  getData<T>(key: string): T | undefined;
  setData<T>(key: string, value: T): void;
  deleteData(key: string): boolean;

  // Hydration strategies
  defineDataStrategy<T>(key: string, captureFn: (value: T) => any, restoreFn: (value: any) => T): void;
  getDataStrategy(key: string): [((value: any) => any) | undefined, ((value: any) => any) | undefined] | undefined;

  /** Whether the current state is for SSR */
  isSSR?: boolean;
}
