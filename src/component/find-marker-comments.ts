import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { getRenderContext } from "../render-context";
import { isServer } from "../util/environment/server";

/**
 * Find existing start and end markers in the DOM by ID.
 *
 * @param {string} id - The ID of the component
 * @returns {[Comment | null, Comment | null]} - Tuple of start and end markers
 */
export const findMarkerComments = (id: string): [Comment | null, Comment | null] => {
  if (isServer()) {
    return getRenderContext().markers.get(id) ?? [null, null];
  }

  const startPattern = SEIDR_COMPONENT_START_PREFIX + id;
  const endPattern = SEIDR_COMPONENT_END_PREFIX + id;

  let start: Comment | null = null;
  let end: Comment | null = null;

  // Use document.createTreeWalker to find markers
  const walker = document.createTreeWalker(document.documentElement, 128 /* SHOW_COMMENT */);
  let child: Comment | null;
  while ((child = walker.nextNode() as Comment | null)) {
    if (child.nodeValue === startPattern) {
      start = child;
    } else if (child.nodeValue === endPattern) {
      end = child;
    }

    // If both markers are found, break the loop
    if (start && end) {
      // If markers are not in the same parent node, warn and return return null
      if (start.parentNode !== end.parentNode && !process.env.CORE_DISABLE_SSR) {
        console.warn(`[${id}] Hydration warning: start and end markers not in the same parent node`);
        start = null;
        end = null;
      }
      break;
    }
  }

  return [start, end];
};
