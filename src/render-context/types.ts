/**
 * RenderContext is used for SSR and hydration.
 */
export interface RenderContext {
  /** Render context ID is used to differentiate render context between requests */
  ctxID: number;

  /** Counter for generating unique IDs */
  sID: number;

  /** Counter for generating unique component IDs */
  cID: number;

  /** Cache for marker comments indexed by component ID */
  markers: Map<string, [Comment, Comment]>;

  /** Feature-specific data extending the render context */
  featureData: Map<string, any>;
}

/**
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
