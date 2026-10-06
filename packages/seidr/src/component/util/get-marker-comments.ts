import { encodeBase62 } from "@fimbul-works/futhark";
import { getAppState } from "../../app-state/app-state.js";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../constants.js";
import { getDocument } from "../../dom/get-document.js";
import { isComment } from "../../dom/type-guards.js";
import { isObj, isStr } from "../../util/type-guards.js";
import type { SeidrComponent } from "../types.js";

/**
 * Get or create boundary markers for a given component or component ID.
 * Uses AppState markers cache for hydration stability.
 *
 * @param {SeidrComponent | string} instanceOrId - The component instance or its ID string
 * @param {boolean} [create=true] - Whether to create markers if they don't exist (default: `true`)
 * @returns {[Comment, Comment] | undefined} - Tuple of start and end markers, or undefined if not created
 */
export const getMarkerComments = (
  instanceOrId: SeidrComponent | string,
  create: boolean = true,
): [Comment, Comment] | undefined => {
  const commentText = isStr(instanceOrId)
    ? instanceOrId
    : process.env.NODE_ENV === "production"
      ? encodeBase62(instanceOrId.id)
      : `${instanceOrId.name}-${encodeBase62(instanceOrId.id)}`;

  // Check for existing
  const state = getAppState();
  const cached = state.markers.get(commentText);
  if (cached) {
    return cached;
  }

  const startText = SEIDR_COMPONENT_START_PREFIX + commentText;
  const endText = SEIDR_COMPONENT_END_PREFIX + commentText;

  // Check if markers already exist in component's existing DOM nodes or siblings
  if (isObj(instanceOrId) && instanceOrId.nodes.length > 0) {
    const nodes = instanceOrId.nodes.filter(Boolean);
    const firstNode = nodes.at(0);
    const lastNode = nodes.at(-1);

    const startComment = isComment(firstNode) && firstNode.textContent === startText ? firstNode : null;
    const endComment = isComment(lastNode) && lastNode.textContent === endText ? lastNode : null;

    if (startComment && endComment) {
      const markers: [Comment, Comment] = [startComment, endComment];
      state.markers.set(commentText, markers);
      return markers;
    }
  }

  if (!create) {
    return undefined;
  }

  const doc = getDocument();
  const markers: [Comment, Comment] = [doc.createComment(startText), doc.createComment(endText)];
  state.markers.set(commentText, markers);
  return markers;
};
