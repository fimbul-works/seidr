import { SeidrError } from "../types";

/**
 * Clears all nodes between a start and end marker comments.
 *
 * @param {Comment} start - Start marker comment
 * @param {Comment} end - End marker comment
 */
export function clearBetween(start: Comment, end: Comment): void {
  if (!start.parentNode) {
    return;
  }

  if (start.parentNode !== end.parentNode) {
    throw new SeidrError("Start and end markers must have the same parent");
  }

  let curr = start.nextSibling;
  while (curr && curr !== end) {
    const next = curr.nextSibling;
    if (curr.parentNode) {
      curr.parentNode.removeChild(curr);
    }
    curr = next;
  }
}
