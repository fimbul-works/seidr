import { isBrowser } from "../util";

/**
 * Find existing start and end markers in the DOM by ID.
 */
export function findMarkerComments(id: string, root?: Node): [Comment | null, Comment | null] {
  const sPattern = `s:${id}`;
  const ePattern = `e:${id}`;

  const searchIn = (node: Node): [Comment | null, Comment | null] => {
    let s: Comment | null = null;
    let e: Comment | null = null;

    if (isBrowser()) {
      const walker = document.createTreeWalker(node, 128 /* SHOW_COMMENT */);
      let n: Comment | null;
      while ((n = walker.nextNode() as Comment | null)) {
        if (n.nodeValue === sPattern) s = n;
        else if (n.nodeValue === ePattern) e = n;
        if (s && e) break;
      }
    } else {
      // SSR fallback
      // TODO: use RenderContext to store markers by id
    }
    return [s, e];
  };

  if (root) return searchIn(root);
  if (typeof document !== "undefined") return searchIn(document.documentElement);

  return [null, null];
}
