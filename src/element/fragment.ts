import { getDOMFactory } from "../dom-factory/index";
import { getRenderContext } from "../render-context";
import type { SeidrFragment } from "./types";

/**
 * Find existing start and end markers in the DOM by ID.
 * Throws if markers exist but are not in the same parent node.
 *
 * @param {string} id - The fragment ID to find
 * @param {Node} [root=document.documentElement] - The root node to search in
 * @returns {[Comment | null, Comment | null]}
 */
export function findMarkers(id: string, root: Node = document.documentElement): [Comment | null, Comment | null] {
  if (typeof document === "undefined") return [null, null];

  const sPattern = `s:${id}`;
  const ePattern = `e:${id}`;

  let s: Comment | null = null;
  let e: Comment | null = null;

  // Optimized search using TreeWalker
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
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
 * Creates a new SeidrFragment (Persistent Range).
 * In the browser, this leverages a native DocumentFragment for initial assembly.
 *
 * @param {Node[]} [children=[]] - Initial children
 * @param {string} [id] - Unique identifier (generated if not provided)
 * @param {Comment} [start] - Existing start marker
 * @param {Comment} [end] - Existing end marker
 * @returns {SeidrFragment}
 */
export function $fragment(children: Node[] = [], id?: string, start?: Comment, end?: Comment): SeidrFragment {
  // Actual deterministic ID logic
  const ctx = getRenderContext();
  const finalId = id || `f-${ctx.idCounter++}`;
  const domFactory = getDOMFactory();

  const s = start || domFactory.createComment(`s:${finalId}`);
  const e = end || domFactory.createComment(`e:${finalId}`);

  const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

  // Use DocumentFragment for efficient initial assembly if creating from scratch
  const fragment = domFactory.createDocumentFragment();

  // Seidr-specific fragment state and methods
  let lastParent = s.parentNode;
  let nextAnchor = e.nextSibling;

  Object.assign(fragment, {
    get isSeidrFragment() {
      return true;
    },
    id: finalId,
    start: s,
    end: e,
    get parent(): ParentNode | null {
      return s.parentNode || lastParent;
    },
    set parent(value: ParentNode | null) {
      lastParent = value;
    },
    get nodes(): Node[] {
      return (this as any).childNodes;
    },
    appendTo(parent: Element) {
      lastParent = parent;
      if (!isProd) {
        parent.appendChild(s);
      }
      // Array.from(this.childNodes).forEach((n) => {
      //   parent.appendChild(n);
      // });
      if (!isProd) {
        parent.appendChild(e);
      } else {
        nextAnchor = e.nextSibling;
      }
    },
    remove() {
      this.clear();
      if (s.parentNode) s.remove();
      if (e.parentNode) e.remove();
    },
    clear() {
      for (const node of Array.from(this.childNodes)) {
        if ((node as any).remove) {
          (node as any).remove();
        } else {
          node.parentNode?.removeChild(node);
        }
      }
    },
    toString(): string {
      const content = Array.from(this.childNodes)
        .map((n: any) => {
          if (n.nodeType === 1) return n.outerHTML ?? (n.toString ? n.toString() : "");
          if (n.nodeType === 3) return n.nodeValue ?? "";
          if (n.nodeType === 8) return `<!--${n.nodeValue}-->`;
          if (n.toString && n.toString().indexOf("[object") === -1) {
            return n.toString();
          }
          return String(n);
        })
        .join("");
      return `<!--s:${finalId}-->${content}<!--e:${finalId}-->`;
    },
  } as SeidrFragment);

  // Initial children are added to extension (range aware)
  children.filter(Boolean).forEach((child) => fragment.appendChild(child));
  const _nodes: Node[] = [];

  // If in production and we have identified markers from SSR, we can remove them
  if (isProd && start && end && s.parentNode) {
    lastParent = s.parentNode;
    nextAnchor = e.nextSibling;
    // Fill internal nodes before removing markers
    let current = s.nextSibling;
    while (current && current !== e) {
      _nodes.push(current as Node);
      current = current.nextSibling;
    }
    s.remove();
    e.remove();
  }

  const target = fragment || {};
  const fragmentProxy = new Proxy(target, {
    get(t, prop, receiver) {
      if (prop in fragment) {
        return Reflect.get(fragment, prop, fragment);
      }
      const val = Reflect.get(t, prop, receiver);
      return typeof val === "function" ? val.bind(t) : val;
    },
    set(t, prop, value, receiver) {
      if (prop in fragment) {
        // Handle writable properties in extension if needed
        return Reflect.set(fragment, prop, value, fragment);
      }
      // Silently ignore or allow setting on target (if not read-only)
      try {
        return Reflect.set(t, prop, value, receiver);
      } catch (e) {
        // Ignore read-only property errors (like parentNode on DocumentFragment)
        return true;
      }
    },
  });

  return fragmentProxy as unknown as SeidrFragment;
}
