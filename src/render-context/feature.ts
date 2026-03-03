import { getAppState } from "./render-context";
import type { AppState, RenderFeature, RenderFeatureOptions } from "./types";

export type { RenderFeature, RenderFeatureOptions } from "./types";

// Global registry to keep track of all created features (useful for backward compatibility)
export const featuresRegistry = new Map<string, RenderFeature<any, any>>();

/**
 * Gets a registered feature.
 *
 * @param id The ID of the feature to get.
 * @returns The feature if it exists, undefined otherwise.
 * @deprecated Use AppState.getData instead.
 */
export const getRenderFeature = <T, S = T>(id: string): RenderFeature<T, S> | undefined =>
  featuresRegistry.get(id) as RenderFeature<T, S> | undefined;

/**
 * Creates and registers a new render feature.
 *
 * @param feature Feature options including ID, default value factory, and optional serialization hooks.
 * @returns The strongly typed RenderFeature token.
 * @deprecated Use AppState data methods and defineDataStrategy instead.
 */
export const createRenderFeature = <T, S = T>(feature: RenderFeatureOptions<T, S>): RenderFeature<T, S> => {
  featuresRegistry.set(feature.id, feature);
  const state = getAppState();
  if (feature.serialize || feature.deserialize) {
    state.defineDataStrategy(
      feature.id,
      (feature.serialize || ((v: any) => v)) as (v: any) => any,
      (feature.deserialize || ((v: any) => v)) as (v: any) => any,
    );
  }
  return feature;
};

/**
 * Gets the feature state from the current application state (or the provided one).
 * Initializes the state if it doesn't exist yet.
 *
 * @param feature The RenderFeature token.
 * @param state Optional AppState. Defaults to the current active state.
 * @returns The feature state.
 * @deprecated Use AppState.getData and AppState.setData instead.
 */
export const getFeature = <T>(feature: RenderFeature<T, any>, state: AppState = getAppState()): T => {
  if (!state.hasData(feature.id)) {
    state.setData(feature.id, feature.defaultValue?.());
  }
  return state.getData(feature.id) as T;
};

/**
 * Sets the feature state in the current application state (or the provided one).
 *
 * @param feature The RenderFeature token.
 * @param value The new state for the feature.
 * @param state Optional AppState. Defaults to the current active state.
 * @deprecated Use AppState.setData instead.
 */
export const setFeature = <T>(feature: RenderFeature<T, any>, value: T, state: AppState = getAppState()): void => {
  state.setData(feature.id, value);
};

/**
 * Serializes all data in AppState using defined strategies.
 *
 * @param state The AppState to serialize.
 * @returns A dictionary of serialized data.
 */
export const serializeAppState = (state: AppState): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, value] of state.data.entries()) {
    const strategy = state.getDataStrategy(key);
    if (strategy?.[0]) {
      result[key] = strategy[0](value);
    } else {
      // Default to direct value if no capture strategy
      result[key] = value;
    }
  }

  return result;
};

/**
 * Deserializes data into the provided AppState using defined strategies.
 *
 * @param state The AppState to populate.
 * @param serializedData A dictionary of serialized data.
 */
export const deserializeAppState = (state: AppState, serializedData: Record<string, any> | undefined): void => {
  if (!serializedData) {
    return;
  }

  for (const [key, value] of Object.entries(serializedData)) {
    const strategy = state.getDataStrategy(key);
    if (strategy?.[1]) {
      state.setData(key, strategy[1](value));
    } else {
      // Default to direct value if no restore strategy
      state.setData(key, value);
    }
  }
};

/** @deprecated Use serializeAppState instead */
export const serializeFeatures = serializeAppState;
/** @deprecated Use deserializeAppState instead */
export const deserializeFeatures = deserializeAppState;
