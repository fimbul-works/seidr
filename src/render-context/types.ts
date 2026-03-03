/**
 * AppState is used for application state management, SSR and hydration.
 */
export interface AppState {
  /** Application state ID is used to differentiate state between requests */
  ctxID: number;

  /** Counter for generating unique IDs */
  sID: number;

  /** Counter for generating unique component IDs */
  cID: number;

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
}

/**
 * @deprecated Use AppState data methods instead.
 * A render feature is a piece of data that is stored in the render context.
 */
export interface RenderFeature<T, S = T> {
  /**
   * The unique identifier of the feature.
   */
  id: string;

  /**
   * The default value of the feature.
   */
  defaultValue?: () => T;

  /**
   * Serializes the feature value for SSR.
   */
  serialize?: (value: T) => S;

  /**
   * Deserializes the feature value from SSR.
   */
  deserialize?: (serialized: S) => T;
}

/**
 * @deprecated Use AppState data methods instead.
 * Options for creating a new render feature.
 */
export interface RenderFeatureOptions<T, S = T> {
  /**
   * The unique identifier of the feature.
   */
  id: string;

  /**
   * The default value of the feature.
   */
  defaultValue?: () => T;

  /**
   * Serializes the feature value for SSR.
   */
  serialize?: (value: T) => S;

  /**
   * Deserializes the feature value from SSR.
   */
  deserialize?: (serialized: S) => T;
}
