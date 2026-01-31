import { getRenderContext } from "../render-context";
import { uid } from "../util/uid";
import type { SeidrFragment, SeidrNode } from "./types";

/**
 * Find existing start and end markers in the DOM by ID.
 * Throws if markers exist but are not in the same parent node.
 *
 * @param {string} id - The fragment ID to find
 * @returns {[Comment | null, Comment | null]}
 */
export function findMarkers(id: string): [Comment | null, Comment | null] {
  if (typeof document === "undefined") return [null, null];

  const sPattern = `s:${id}`;
  const ePattern = `e:${id}`;

  let s: Comment | null = null;
  let e: Comment | null = null;

  // Optimized search using TreeWalker
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT);
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
  let finalId = id;
  if (!finalId) {
    try {
      const rc = getRenderContext();
      finalId = `f-${rc.idCounter++}`;
    } catch (e) {
      finalId = uid();
    }
  }

  const s = start || (document.createComment(`s:${finalId}`) as Comment);
  const e = end || (document.createComment(`e:${finalId}`) as Comment);

  const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

  // Use DocumentFragment for efficient initial assembly if creating from scratch
  const df = !start && !end && typeof document !== "undefined" ? document.createDocumentFragment() : null;
  if (df) {
    df.appendChild(s);
    children.forEach((child) => {
      if (child) df.appendChild(child);
    });
    df.appendChild(e);
  }

  // Seidr-specific fragment state and methods
  let lastParent = s.parentNode;
  let nextAnchor = e.nextSibling;
  const _nodes: Node[] = [];

  // Initial children
  if (children.length > 0) {
    children.forEach((c) => {
      if (c) _nodes.push(c as Node);
    });
  }

  const extension = {
    isSeidrFragment: true as const,
    id: finalId,
    start: s,
    end: e,

    get nodes() {
      if (!isProd || (s.parentNode && e.parentNode)) {
        const result: Node[] = [];
        let current = s.nextSibling;
        while (current && current !== e) {
          result.push(current as Node);
          current = current.nextSibling;
        }
        return result;
      }
      return _nodes;
    },

    get parentNode() {
      return s.parentNode || lastParent;
    },

    get nextSibling() {
      return e.nextSibling || nextAnchor;
    },

    append(...nodes: (Node | string)[]) {
      const p = s.parentNode || lastParent;
      const ref = e.parentNode ? e : nextAnchor;
      if (p) {
        for (const node of nodes) {
          const n = typeof node === "string" ? document.createTextNode(node) : node;
          p.insertBefore(n, ref);
          if (isProd) _nodes.push(n);
        }
      } else if (df) {
        df.append(...nodes);
        if (isProd) {
          // Manual sync for prod track if needed, but normally df is pre-attachment
          for (const node of nodes) {
            const n = typeof node === "string" ? document.createTextNode(node) : node;
            _nodes.push(n);
          }
        }
      }
    },

    prepend(...nodes: (Node | string)[]) {
      const p = s.parentNode || lastParent;
      const ref = s.parentNode ? s.nextSibling : df ? s.firstChild : null;
      if (p) {
        for (const node of nodes) {
          const n = typeof node === "string" ? document.createTextNode(node) : node;
          p.insertBefore(n, ref || (e.parentNode ? e : nextAnchor));
          if (isProd) {
            const idx = ref ? _nodes.indexOf(ref) : _nodes.length;
            if (idx !== -1) _nodes.splice(idx, 0, n);
            else _nodes.unshift(n);
          }
        }
      } else if (df) {
        df.prepend(...nodes);
        if (isProd) {
          const nodeObjects = nodes.map((n) => (typeof n === "string" ? document.createTextNode(n) : n));
          _nodes.unshift(...nodeObjects);
        }
      }
    },

    moveBefore(node: Node, ref: Node | null) {
      // Proxy to insertBefore if moveBefore is not natively optimized or available
      this.insertBefore(node, ref);
    },

    replaceChildren(...nodes: (Node | string)[]) {
      this.clear();
      this.append(...nodes);
    },

    querySelector(selector: string) {
      if (s.parentNode) {
        // Search in live range
        const nodes = this.nodes;
        for (const node of nodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if ((node as Element).matches(selector)) return node;
            const found = (node as Element).querySelector(selector);
            if (found) return found;
          }
        }
        return null;
      }
      return df ? df.querySelector(selector) : null;
    },

    querySelectorAll(selector: string) {
      if (s.parentNode) {
        const results: Element[] = [];
        const nodes = this.nodes;
        for (const node of nodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if ((node as Element).matches(selector)) results.push(node as Element);
            results.push(...Array.from((node as Element).querySelectorAll(selector)));
          }
        }
        return results;
      }
      return df ? df.querySelectorAll(selector) : [];
    },

    getElementById(id: string) {
      return this.querySelector(`#${id}`);
    },

    appendChild(node: Node) {
      this.append(node);
    },

    insertBefore(node: Node, ref: Node | null) {
      const p = s.parentNode || lastParent;
      const actualRef = ref || (e.parentNode ? e : nextAnchor);
      if (p) {
        p.insertBefore(node, actualRef);
        if (isProd) {
          const idx = ref ? _nodes.indexOf(ref) : -1;
          if (idx !== -1) _nodes.splice(idx, 0, node);
          else _nodes.push(node);
        }
      } else if (df) {
        df.insertBefore(node, ref || e);
        if (isProd) {
          const idx = ref ? _nodes.indexOf(ref) : -1;
          if (idx !== -1) _nodes.splice(idx, 0, node);
          else _nodes.push(node);
        }
      }
    },

    remove() {
      this.clear();
      if (s.parentNode) s.remove();
      if (e.parentNode) e.remove();
    },

    clear() {
      const nodes = this.nodes;
      for (const node of nodes) {
        if ((node as any).remove) {
          (node as any).remove();
        } else {
          node.parentNode?.removeChild(node);
        }
      }
      if (isProd) _nodes.length = 0;
    },

    appendTo(parent: Element) {
      lastParent = parent;
      if (!isProd) {
        parent.appendChild(s);
      }
      this.nodes.forEach((n) => parent.appendChild(n));
      if (!isProd) {
        parent.appendChild(e);
      } else {
        nextAnchor = e.nextSibling;
      }
    },

    toString() {
      const childrenStr = this.nodes
        .map((child: any) => {
          if (child.nodeType === Node.TEXT_NODE) return child.nodeValue;
          if (child.nodeType === Node.ELEMENT_NODE) return child.outerHTML;
          if (child.nodeType === Node.COMMENT_NODE) return `<!--${child.nodeValue}-->`;
          return "";
        })
        .join("");
      return `<!--s:${finalId}-->${childrenStr}<!--e:${finalId}-->`;
    },
  };

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

  const target = df || {};
  const fragment = new Proxy(target, {
    get(t, prop, receiver) {
      if (prop in extension) {
        return Reflect.get(extension, prop, extension);
      }
      const val = Reflect.get(t, prop, receiver);
      return typeof val === "function" ? val.bind(t) : val;
    },
    set(t, prop, value, receiver) {
      if (prop in extension) {
        // Handle writable properties in extension if needed
        return Reflect.set(extension, prop, value, extension);
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

  return fragment as unknown as SeidrFragment;
}

/** @deprecated Use $fragment */
export const createFragment = $fragment;
