import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { getDocument } from "../dom/get-document";
import { getAppState } from "../render-context/render-context";

/**
 * Get or create boundary markers for a given ID.
 * Uses AppState cache for stability.
 *
 * @param {string} id - The ID of the component
 * @returns {[Comment, Comment]} - Tuple of start and end markers
 */
export const getMarkerComments = (id: string): [Comment, Comment] => {
  const state = getAppState();

  const cached = state.markers.get(id);
  if (cached) {
    return cached;
  }

  const doc = getDocument();
  const markers: [Comment, Comment] = [
    doc.createComment(SEIDR_COMPONENT_START_PREFIX + id),
    doc.createComment(SEIDR_COMPONENT_END_PREFIX + id),
  ];

  state.markers.set(id, markers);
  return markers;
};
