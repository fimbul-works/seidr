import { getDOMFactory } from "../dom-factory/index";
import { getRenderContext } from "../render-context";
import { SEIDR_CLEANUP, TYPE, TYPE_PROP } from "../types";
import type { SeidrFragment } from "./types";

/**
 * Find existing start and end markers in the DOM by ID.
 * Throws if markers exist but are not in the same parent node.
 *
 * @param {string} id - The fragment ID to find
 * @param {Node} [root] - The root node to search in
 * @returns {[Comment | null, Comment | null]}
 */
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
  const ctx = getRenderContext();
  const finalId = id || `f-${ctx.idCounter++}`;
  const domFactory = getDOMFactory();

  const s = start || domFactory.createComment(`s:${finalId}`);
  const e = end || domFactory.createComment(`e:${finalId}`);

  // 1. Create the base fragment node
  const fragment = domFactory.createDocumentFragment();

  // 2. Internal state trackers (captured via closure)
  let lastParent: Node | null = null;
  let nextAnchor: Node | null = null;

  // 3. Helper logic
  const getRangeNodes = (): Node[] => {
    // Check tracked children first (connected or persistent state)
    const tracked = ctx.fragmentChildren.get(fragment);
    if (tracked) return tracked;

    // Disconnected state: Use native DocumentFragment children, excluding markers
    return Array.from(fragment.childNodes).filter((n) => n !== s && n !== e);
  };

  const trackNodes = (nodes: Node[]) => {
    const current = ctx.fragmentChildren.get(fragment) || [];
    for (const node of nodes) {
      if (node !== s && node !== e && !current.includes(node)) {
        current.push(node);
      }
      ctx.fragmentOwners.set(node, fragment);
    }
    ctx.fragmentChildren.set(fragment, current);
  };

  // 4. Capture original methods (unbound for flexible use with .call)
  const _insertBefore = fragment.insertBefore.bind(fragment);
  const _appendChild = fragment.appendChild.bind(fragment);
  const _querySelector = fragment.querySelector.bind(fragment);
  const _querySelectorAll = fragment.querySelectorAll.bind(fragment);
  const _getElementById = fragment.getElementById.bind(fragment);

  // 5. SeidrFragment method implementations
  // We use regular functions to ensure proper 'this' binding when called as methods.

  function appendTo(this: SeidrFragment, parent: Element | DocumentFragment, anchor: Node | null = null) {
    const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    ctx.fragmentParents.set(this, parent);
    lastParent = parent;

    const currentNodes = this.nodes;
    ctx.fragmentChildren.set(this, currentNodes);

    if (!isProd) {
      parent.insertBefore(s, anchor);
      ctx.fragmentOwners.set(s, this);
    }

    for (const node of currentNodes) {
      if (node === (this as any)) continue;
      parent.insertBefore(node, anchor);
      ctx.fragmentOwners.set(node, this);
    }

    if (!isProd) {
      parent.insertBefore(e, anchor);
      ctx.fragmentOwners.set(e, this);
    } else {
      nextAnchor = anchor;
    }
  }

  function insertBefore<T extends Node>(this: SeidrFragment, node: T, anchor: Node | null): T {
    const parent = ctx.fragmentParents.get(this) || s.parentNode || lastParent;
    let actualAnchor =
      anchor === null &&
      (s.parentNode === null || (typeof process !== "undefined" && process.env.NODE_ENV === "production"))
        ? nextAnchor
        : anchor;

    // Default anchor to end marker if connected and anchor is null
    if (actualAnchor === null && s.parentNode) actualAnchor = e;

    if (node === (this as any)) {
      throw new Error("Cannot insert a fragment into itself.");
    }

    // Normalize anchor if it's a SeidrFragment
    if (actualAnchor && (actualAnchor as any)[TYPE_PROP] === TYPE.FRAGMENT) {
      actualAnchor = (actualAnchor as any).start;
    }

    if (parent) {
      const isFrag = (node as any)[TYPE_PROP] === TYPE.FRAGMENT;

      // Safety check for anchor
      // In SSR, we need to account for Proxies when comparing parents
      if (actualAnchor) {
        const anchorParent = actualAnchor.parentNode;
        const matchesParent =
          anchorParent === parent || ((parent as any).__isProxy && anchorParent === (parent as any).__target);
        if (!matchesParent) {
          actualAnchor = null;
        }
      }

      if (isFrag) {
        // Prevent infinite recursion if node is this same fragment
        if (node === (this as any) || node === parent) {
          return node;
        }
        (node as any).appendTo(parent as any, actualAnchor);
      } else {
        // If parent is also a fragment, bypass its enhanced insertBefore to avoid recursion
        const parentAsAny = parent as any;
        if (parentAsAny === this) {
          _insertBefore.call(this, node, actualAnchor);
        } else if (parentAsAny._originalInsertBefore && parentAsAny[TYPE_PROP] === TYPE.FRAGMENT) {
          parentAsAny._originalInsertBefore.call(parent, node, actualAnchor);
        } else {
          parent.insertBefore(node, actualAnchor);
        }
      }

      // Update tracked children
      const tracked = ctx.fragmentChildren.get(this) || [];
      const index = actualAnchor ? tracked.indexOf(actualAnchor) : -1;
      if (index === -1) tracked.push(node);
      else tracked.splice(index, 0, node);
      ctx.fragmentChildren.set(this, tracked);
    } else {
      // Disconnected: use native DocumentFragment logic
      const isFrag = (node as any)[TYPE_PROP] === TYPE.FRAGMENT;
      if (isFrag) {
        (node as any).appendTo(this, anchor);
      } else {
        _insertBefore.call(this, node, anchor);
      }

      // Sync tracked child list for disconnected state
      const tracked = ctx.fragmentChildren.get(this) || Array.from(this.childNodes).filter((n) => n !== s && n !== e);
      const index = anchor ? tracked.indexOf(anchor) : -1;
      if (index === -1) tracked.push(node);
      else tracked.splice(index, 0, node);
      ctx.fragmentChildren.set(this, tracked);
    }
    ctx.fragmentOwners.set(node, this);
    return node;
  }

  function appendChild<T extends Node>(this: SeidrFragment, node: T): T {
    const anchor = s.parentNode ? e : s.parentNode === null && lastParent ? nextAnchor : null;
    return this.insertBefore(node, anchor);
  }

  function append(this: SeidrFragment, ...nodes: (Node | string)[]) {
    nodes.forEach((node) => {
      const n = typeof node === "string" ? domFactory.createTextNode(node) : node;
      this.appendChild(n);
    });
  }

  function prepend(this: SeidrFragment, ...nodes: (Node | string)[]) {
    nodes.reverse().forEach((node) => {
      const n = typeof node === "string" ? domFactory.createTextNode(node) : node;
      this.insertBefore(n, s.parentNode ? s.nextSibling : this.firstChild);
    });
  }

  function replaceChildren(this: SeidrFragment, ...nodes: (Node | string)[]) {
    this.clear();
    this.append(...nodes);
  }

  function querySelector(this: SeidrFragment, selector: string): any {
    if (s.parentNode || lastParent) {
      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          const el = node as any;
          if (el.id === selector.substring(1) && selector.startsWith("#")) return node;
          if (el.matches && el.matches(selector)) return node;
          const found = el.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    }
    return _querySelector ? _querySelector.call(this, selector) : null;
  }

  function querySelectorAll(this: SeidrFragment, selector: string): any {
    if (s.parentNode || lastParent) {
      const results: any[] = [];
      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          const el = node as any;
          if (el.matches && el.matches(selector)) results.push(node);
          results.push(...Array.from(el.querySelectorAll(selector)));
        }
      }
      return results;
    }
    return _querySelectorAll ? _querySelectorAll.call(this, selector) : [];
  }

  function getElementById(this: SeidrFragment, id: string): any {
    if (s.parentNode || lastParent) {
      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          const el = node as any;
          if (el.id === id) return node;
          const found = el.querySelector(`#${id}`);
          if (found) return found;
        }
      }
      return null;
    }
    return _getElementById ? _getElementById.call(this, id) : null;
  }

  function clear(this: SeidrFragment) {
    const currentNodes = this.nodes;
    for (const node of currentNodes) {
      if ((node as any).remove) {
        (node as any).remove();
      } else if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      ctx.fragmentOwners.delete(node);
    }
    ctx.fragmentChildren.set(this, []);
  }

  function remove(this: SeidrFragment) {
    const currentNodes = this.nodes;
    if ((this as any)[SEIDR_CLEANUP]) (this as any)[SEIDR_CLEANUP]();

    // Instead of just removing from DOM, move them back into the fragment bucket
    // to preserve them for potential re-attachment.
    _appendChild.call(this, s);
    for (const node of currentNodes) {
      _appendChild.call(this, node);
    }
    _appendChild.call(this, e);

    // Clear tracking
    lastParent = null;
    ctx.fragmentParents.delete(this);

    // Clean up owners
    for (const node of currentNodes) {
      ctx.fragmentOwners.delete(node);
    }
    ctx.fragmentOwners.delete(s);
    ctx.fragmentOwners.delete(e);
  }

  function toString(this: SeidrFragment): string {
    return this.nodes.map((n: any) => (n.toString ? n.toString() : String(n))).join("");
  }

  const f = fragment as unknown as SeidrFragment;

  // 6. Augment the fragment object
  Object.defineProperties(f, {
    [TYPE_PROP]: { value: TYPE.FRAGMENT, enumerable: true },
    id: { value: finalId, enumerable: true },
    start: { value: s, enumerable: true },
    end: { value: e, enumerable: true },
    nodes: {
      get: getRangeNodes,
      enumerable: true,
    },
    parentNode: {
      get: () => ctx.fragmentParents.get(fragment) || s.parentNode,
      enumerable: true,
    },
    nextSibling: {
      get: () => e.nextSibling,
      enumerable: true,
    },
    previousSibling: {
      get: () => s.previousSibling,
      enumerable: true,
    },
    // Captured originals for internal/external bypass
    _originalInsertBefore: { value: _insertBefore, enumerable: false },
    _originalAppendChild: { value: _appendChild, enumerable: false },
  });

  // Assign bound methods
  Object.assign(f, {
    appendTo: appendTo.bind(f),
    insertBefore: insertBefore.bind(f),
    appendChild: appendChild.bind(f),
    append: append.bind(f),
    prepend: prepend.bind(f),
    replaceChildren: replaceChildren.bind(f),
    querySelector: querySelector.bind(f),
    querySelectorAll: querySelectorAll.bind(f),
    getElementById: getElementById.bind(f),
    clear: clear.bind(f),
    remove: remove.bind(f),
    toString: toString.bind(f),
    [SEIDR_CLEANUP]: () => {
      for (const node of f.nodes) {
        if ((node as any)[SEIDR_CLEANUP]) (node as any)[SEIDR_CLEANUP]();
      }
      ctx.fragmentChildren.delete(f);
      ctx.fragmentParents.delete(f);
    },
  });

  // 7. Initial Assembly
  if (!s.parentNode) _appendChild.call(fragment, s);
  if (e.parentNode !== fragment && !e.parentNode) _appendChild.call(fragment, e);

  // 8. Process initial children
  for (const child of children) {
    if (child) {
      f.appendChild(child);
      ctx.fragmentOwners.set(child, f);
    }
  }

  // 9. Hydration support: If markers already exist, track them and the nodes between them
  if (start && end && s.parentNode) {
    const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    const nodesFromDOM = (): Node[] => {
      const res: Node[] = [];
      let curr = s.nextSibling;
      while (curr && curr !== e) {
        res.push(curr as Node);
        curr = curr.nextSibling;
      }
      return res;
    };

    const nodes = nodesFromDOM();

    if (isProd) {
      // In production, elide the markers for hydration if they were found
      lastParent = s.parentNode;
      ctx.fragmentParents.set(f, lastParent);
      nextAnchor = e.nextSibling;
      ctx.fragmentChildren.set(f, nodes);
      s.remove();
      e.remove();
    }

    trackNodes([s, e, ...nodes]);
  }

  return f;
}
