/**
 * Clears all nodes between a start and end marker.
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
