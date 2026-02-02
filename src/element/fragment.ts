import { getDOMFactory } from "../dom-factory/index";
import { getRenderContext } from "../render-context";
import { TYPE, TYPE_PROP } from "../types";
import type { SeidrFragment } from "./types";

/**
 * Find existing start and end markers in the DOM by ID.
 * Throws if markers exist but are not in the same parent node.
 *
 * @param {string} id - The fragment ID to find
 * @param {Node} [root] - The root node to search in
 * @returns {[Comment | null, Comment | null]}
 */

/**
 * Clears all nodes between a start and end marker.
 *
 * @param {Node} s - Start marker
 * @param {Node} e - End marker
 */
export function clearBetween(s: Node, e: Node): void {
  if (s.parentNode) {
    let curr = s.nextSibling;
    while (curr && curr !== e) {
      const next = curr.nextSibling;
      if (curr.parentNode) curr.parentNode.removeChild(curr);
      curr = next;
    }
  }
}

export function findMarkers(id: string, root?: Node): [Comment | null, Comment | null] {
  if (typeof document === "undefined") return [null, null];
  const actualRoot = root || document.documentElement;

  const sPattern = `s:${id}`;
  const ePattern = `e:${id}`;

  let s: Comment | null = null;
  let e: Comment | null = null;

  // Optimized search using TreeWalker
  if (typeof (document as any).createTreeWalker !== "function") {
    // Return early in environments without TreeWalker (SSR)
    return [null, null];
  }

  const walker = document.createTreeWalker(actualRoot, NodeFilter.SHOW_COMMENT);
  let node: Comment | null;
  while ((node = walker.nextNode() as Comment | null)) {
    const val = node.nodeValue;
    if (val === sPattern) s = node;
    else if (val === ePattern) e = node;
    if (s && e) break;
  }

  // Final check for parent consistency
  if (s && e && s.parentNode !== e.parentNode) {
    throw new Error(`Malformed SSR: Fragment ${id} markers have different parents`);
  }

  return [s, e];
}

/**
 * Creates a new SeidrFragment (Ephemeral).
 * It wraps children with start and end markers (HTML Comments).
 *
 * @param {Node[]} [children=[]] - Initial children
 * @param {string} [id] - Unique identifier (generated if not provided)
 * @param {Comment} [start] - Existing start marker (hydration)
 * @param {Comment} [end] - Existing end marker (hydration)
 * @returns {SeidrFragment}
 */
export function $fragment(children: Node[] = [], id?: string, start?: Comment, end?: Comment): SeidrFragment {
  const ctx = getRenderContext();
  const finalId = id || `f-${ctx.idCounter++}`;
  const domFactory = getDOMFactory();

  const s = start || domFactory.createComment(`s:${finalId}`);
  const e = end || domFactory.createComment(`e:${finalId}`);

  // 1. Create the base fragment node
  const fragment = domFactory.createDocumentFragment() as unknown as SeidrFragment;

  // 2. Setup Properties
  Object.defineProperties(fragment, {
    [TYPE_PROP]: { value: TYPE.FRAGMENT, enumerable: true },
    id: { value: finalId, enumerable: true },
    start: { value: s, enumerable: true },
    end: { value: e, enumerable: true },
  });

  // Only append if we created new markers (Creation Mode).
  // If markers were passed (Hydration Mode), we assume they are already in DOM
  // and we DO NOT want to extract/move them. The fragment becomes a lightweight handle.
  if (!start && !end) {
    fragment.appendChild(s);
    children.forEach((c) => fragment.appendChild(c));
    fragment.appendChild(e);
  }

  return fragment;
}
