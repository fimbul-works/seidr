import { getAppState } from "../app-state/get-app-state.js";
import type { SeidrComponent } from "./types.js";

/**
 * Gets the set of all registered components.
 *
 * @returns The set of all registered components.
 * @internal
 */
export const getComponentRegitry = () => getAppState().getData<Set<SeidrComponent>>("seidr.components", new Set());

/**
 * Gets the node registry for the current application state.
 *
 * @returns A weak map of nodes to their owning components.
 * @internal
 */
export const getNodeIndex = () =>
  getAppState().getData<WeakMap<ChildNode, SeidrComponent>>("seidr.nodeIndex", new WeakMap());

/**
 * Gets the marker comments for the current application state.
 *
 * @returns A map of marker comments indexed by component ID.
 * @internal
 */
export const getMarkerRegistry = () =>
  getAppState().getData<Map<string, [Comment, Comment]>>("seidr.markers", new Map());
