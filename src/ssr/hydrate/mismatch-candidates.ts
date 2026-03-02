/**
 * Storage for hydration mismatch candidates.
 * Maps a new node to the stale node it intends to replace.
 */
export const mismatchCandidates = new WeakMap<Node, Node>();
