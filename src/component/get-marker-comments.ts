import { getAppState } from "../app-state/app-state";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { getDocument } from "../dom/get-document";

/**
 * Get or create boundary markers for a given ID.
 * Uses AppState cache for stability.
 *
 * @param {string} id - The ID of the component
 * @param {boolean} [create=true] - Whether to create markers if they don't exist
 * @returns {[Comment, Comment] | undefined} - Tuple of start and end markers, or undefined if not created
 */
export const getMarkerComments = (id: string, create: boolean = true): [Comment, Comment] | undefined => {
  const state = getAppState();

  const cached = state.markers.get(id);
  if (cached) {
    return cached;
  }

  if (!create) {
    return undefined;
  }

  const doc = getDocument();
  const markers: [Comment, Comment] = [
    doc.createComment(SEIDR_COMPONENT_START_PREFIX + id),
    doc.createComment(SEIDR_COMPONENT_END_PREFIX + id),
  ];

  state.markers.set(id, markers);
  return markers;
};
