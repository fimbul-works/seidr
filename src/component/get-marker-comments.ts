import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { getDOMFactory } from "../dom/dom-factory";
import { getRenderContext } from "../render-context/render-context";
import { findMarkerComments } from "./find-marker-comments";

/**
 * Get or create boundary markers for a given ID.
 * Uses RenderContext cache for stability.
 *
 * @param {string} id - The ID of the component
 * @returns {[Comment, Comment]} - Tuple of start and end markers
 */
export const getMarkerComments = (id: string): [Comment, Comment] => {
  const ctx = getRenderContext();

  const cached = ctx.markers.get(id);
  if (cached) {
    return cached;
  }

  const domFactory = getDOMFactory();
  const [start, end] = findMarkerComments(id);

  const markers: [Comment, Comment] = [
    start ?? domFactory.createComment(SEIDR_COMPONENT_START_PREFIX + id),
    end ?? domFactory.createComment(SEIDR_COMPONENT_END_PREFIX + id),
  ];

  ctx.markers.set(id, markers);
  return markers;
};
