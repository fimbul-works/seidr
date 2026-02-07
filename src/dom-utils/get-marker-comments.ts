import { getDOMFactory } from "../dom-factory/index.js";
import { findMarkerComments } from "./find-marker-comments.js";

/**
 * Finds or creates start and end markers for a given ID.
 *
 * @param {string} id - Unique identifier
 * @returns {[Comment, Comment]}
 */
export function getMarkerComments(id: string): [Comment, Comment] {
  const domFactory = getDOMFactory();

  let [start, end] = findMarkerComments(id);
  if (!start) start = domFactory.createComment(`s:${id}`);
  if (!end) end = domFactory.createComment(`e:${id}`);

  return [start, end];
}
