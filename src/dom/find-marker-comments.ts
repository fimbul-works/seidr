import { getRenderContext } from "../render-context";
import { isClient } from "../util/environment/browser";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "./marker-comment-prefix";

/**
 * Find existing start and end markers in the DOM by ID.
 *
 * @param {string} id - The ID of the component
 * @param {Node} [root] - The root node to search in
 * @returns {[Comment | null, Comment | null]} - Tuple of start and end markers
 */
export function findMarkerComments(id: string, root?: Node): [Comment | null, Comment | null] {
  const startPattern = SEIDR_COMPONENT_START_PREFIX + id;
  const endPattern = SEIDR_COMPONENT_END_PREFIX + id;

  const searchIn = (node: Node): [Comment | null, Comment | null] => {
    let start: Comment | null = null;
    let end: Comment | null = null;

    if (isClient()) {
      // Use document.createTreeWalker to find markers
      const walker = document.createTreeWalker(node, 128 /* SHOW_COMMENT */);
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
          // @ts-expect-error
          if (start.parentNode !== end.parentNode && process.env.CORE_DISABLE_SSR === false) {
            console.warn(
              `Hydration warning: start and end markers for component ${id} are not in the same parent node`,
            );
            start = null;
            end = null;
          }
          break;
        }
      }
      return [start, end];
    }

    // SSR fallback
    return getRenderContext().markers.get(id) ?? [null, null];
  };

  if (isClient()) return searchIn(document.documentElement);
  if (root) return searchIn(root);

  return [null, null];
}
