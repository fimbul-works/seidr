import { encodeBase62 } from "@fimbul-works/futhark";
import { getAppState } from "../../app-state/app-state.js";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../constants.js";
import { getDocument } from "../../dom/get-document.js";
import { isComment } from "../../dom/type-guards.js";
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
  const commentText =
    typeof instanceOrId === "string"
      ? instanceOrId
      : process.env.NODE_ENV === "production"
        ? encodeBase62(instanceOrId.id)
        : `${instanceOrId.name}-${encodeBase62(instanceOrId.id)}`;

  const state = getAppState();
  const cached = state.markers.get(commentText);
  if (cached && cached[0] && cached[1]) {
    return cached;
  }

  // Check if markers already exist in component's existing DOM nodes or siblings
  if (typeof instanceOrId !== "string" && instanceOrId.nodes && instanceOrId.nodes.length > 0) {
    const nodes = instanceOrId.nodes.filter(Boolean);
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    const startText = SEIDR_COMPONENT_START_PREFIX + commentText;
    const endText = SEIDR_COMPONENT_END_PREFIX + commentText;

    let startComment: Comment | undefined =
      isComment(firstNode) && firstNode.textContent === startText ? (firstNode as Comment) : cached?.[0];
    let endComment: Comment | undefined =
      isComment(lastNode) && lastNode.textContent === endText ? (lastNode as Comment) : cached?.[1];

    if (!startComment && firstNode?.previousSibling && isComment(firstNode.previousSibling)) {
      const prev = firstNode.previousSibling as Comment;
      if (
        prev.textContent === startText ||
        prev.textContent?.startsWith(SEIDR_COMPONENT_START_PREFIX + instanceOrId.name)
      ) {
        startComment = prev;
      }
    }

    if (!endComment && lastNode?.nextSibling && isComment(lastNode.nextSibling)) {
      const next = lastNode.nextSibling as Comment;
      if (
        next.textContent === endText ||
        next.textContent?.startsWith(SEIDR_COMPONENT_END_PREFIX + instanceOrId.name)
      ) {
        endComment = next;
      }
    }

    if (startComment && endComment) {
      const markers: [Comment, Comment] = [startComment, endComment];
      state.markers.set(commentText, markers);
      return markers;
    }
  }

  if (!create) {
    return cached && (cached[0] || cached[1]) ? cached : undefined;
  }

  const doc = getDocument();
  const markers: [Comment, Comment] = [
    cached?.[0] || doc.createComment(SEIDR_COMPONENT_START_PREFIX + commentText),
    cached?.[1] || doc.createComment(SEIDR_COMPONENT_END_PREFIX + commentText),
  ];

  state.markers.set(commentText, markers);
  return markers;
};
