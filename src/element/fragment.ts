import { getDOMFactory } from "../dom-factory/index";
import { getRenderContext } from "../render-context";
import type { SeidrFragment } from "./types";
import { SEIDR_CLEANUP } from "./types";

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
  const ctx = getRenderContext();
  const finalId = id || `f-${ctx.idCounter++}`;
  const domFactory = getDOMFactory();

  const s = start || domFactory.createComment(`s:${finalId}`);
  const e = end || domFactory.createComment(`e:${finalId}`);

  // Inherit from DocumentFragment
  const fragment = domFactory.createDocumentFragment() as SeidrFragment;

  /**
   * Helper to get nodes currently between markers in the DOM.
   */
  const getRangeNodes = (): Node[] => {
    const nodes: Node[] = [];
    let current = s.nextSibling;
    while (current && current !== e) {
      nodes.push(current);
      current = current.nextSibling;
    }
    return nodes;
  };

  /**
   * Helper to update node ownership in the RenderContext.
   */
  const trackNodes = (nodes: Node[]) => {
    for (const node of nodes) {
      ctx.fragmentOwners.set(node, fragment);
    }
  };

  Object.defineProperties(fragment, {
    isSeidrFragment: { value: true, enumerable: true },
    id: { value: finalId, enumerable: true },
    start: { value: s, enumerable: true },
    end: { value: e, enumerable: true },
    nodes: {
      get() {
        // If markers are in the DOM, return the current live range.
        if (s.parentNode) {
          return getRangeNodes();
        }
        // If markers are missing but we have tracked children (e.g. production elision)
        const tracked = ctx.fragmentChildren.get(fragment);
        if (tracked) return tracked;

        // Fallback to DocumentFragment's childNodes
        return Array.from(fragment.childNodes);
      },
      enumerable: true,
    },
    parentNode: {
      get: () => s.parentNode,
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
  });

  let lastParent: Node | null = null;
  let nextAnchor: Node | null = null;

  // This is a new method, and thus we can keep
  fragment.appendTo = (parent: Element | DocumentFragment, anchor: Node | null = null) => {
    const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    lastParent = parent;

    const currentNodes = fragment.nodes;

    if (!isProd) {
      parent.insertBefore(s, anchor);
    }

    for (const node of currentNodes) {
      parent.insertBefore(node, anchor);
    }

    if (!isProd) {
      parent.insertBefore(e, anchor);
    } else {
      ctx.fragmentChildren.set(fragment, currentNodes);
      nextAnchor = anchor;
    }

    // Track ownership once connected
    trackNodes([s, e, ...currentNodes]);
  };

  fragment.insertBefore = <T extends Node>(node: T, anchor: Node | null): T => {
    const parent = s.parentNode || lastParent;
    let actualAnchor = anchor === null && s.parentNode === null ? nextAnchor : anchor;

    // Normalize anchor if it's a SeidrFragment
    if (actualAnchor && (actualAnchor as any).isSeidrFragment) {
      actualAnchor = (actualAnchor as any).start;
    }

    if (parent) {
      const isFrag = (node as any).isSeidrFragment;

      // Safety check for anchor
      if (actualAnchor && actualAnchor.parentNode !== parent) {
        actualAnchor = null;
      }

      if (isFrag) {
        (node as any).appendTo(parent as any, actualAnchor);
      } else {
        parent.insertBefore(node, actualAnchor);
      }

      // Update tracked children if markers are elided
      if (!s.parentNode && !e.parentNode) {
        const tracked = ctx.fragmentChildren.get(fragment) || [];
        const index = anchor ? tracked.indexOf(anchor) : -1;
        if (index === -1) tracked.push(node);
        else tracked.splice(index, 0, node);
        ctx.fragmentChildren.set(fragment, tracked);
      }
    } else {
      const isFrag = (node as any).isSeidrFragment;
      if (isFrag) {
        (node as any).appendTo(fragment, anchor);
      } else {
        (fragment as any).constructor.prototype.insertBefore.call(fragment, node, anchor);
      }
    }
    ctx.fragmentOwners.set(node, fragment);
    return node;
  };

  fragment.appendChild = <T extends Node>(node: T): T => {
    const anchor = s.parentNode ? e : s.parentNode === null && lastParent ? nextAnchor : null;
    return fragment.insertBefore(node, anchor);
  };

  fragment.append = (...nodes: (Node | string)[]) => {
    nodes.forEach((node) => {
      const n = typeof node === "string" ? domFactory.createTextNode(node) : node;
      fragment.appendChild(n);
    });
  };

  fragment.prepend = (...nodes: (Node | string)[]) => {
    nodes.reverse().forEach((node) => {
      const n = typeof node === "string" ? domFactory.createTextNode(node) : node;
      fragment.insertBefore(n, s.parentNode ? s.nextSibling : fragment.firstChild);
    });
  };

  fragment.replaceChildren = (...nodes: (Node | string)[]) => {
    fragment.clear();
    fragment.append(...nodes);
  };

  fragment.querySelector = (selector: string): any => {
    if (s.parentNode || lastParent) {
      for (const node of fragment.nodes) {
        if (node instanceof Element) {
          if (node.matches(selector)) return node;
          const found = node.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    }
    return (fragment as any).constructor.prototype.querySelector.call(fragment, selector);
  };

  fragment.querySelectorAll = (selector: string): any => {
    if (s.parentNode || lastParent) {
      const results: Element[] = [];
      for (const node of fragment.nodes) {
        if (node instanceof Element) {
          if (node.matches(selector)) results.push(node);
          results.push(...Array.from(node.querySelectorAll(selector)));
        }
      }
      return results;
    }
    return (fragment as any).constructor.prototype.querySelectorAll.call(fragment, selector);
  };

  fragment.getElementById = (id: string): any => {
    if (s.parentNode || lastParent) {
      for (const node of fragment.nodes) {
        if (node instanceof Element) {
          if (node.id === id) return node;
          const found = node.querySelector(`#${id}`);
          if (found) return found;
        }
      }
      return null;
    }
    return (fragment as any).constructor.prototype.getElementById.call(fragment, id);
  };

  fragment.clear = () => {
    const currentNodes = fragment.nodes;
    for (const node of currentNodes) {
      if ((node as any).remove) {
        (node as any).remove();
      } else if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      ctx.fragmentOwners.delete(node);
    }
    ctx.fragmentChildren.delete(fragment);
  };

  (fragment as any)[SEIDR_CLEANUP] = () => {
    for (const node of fragment.nodes) {
      if ((node as any)[SEIDR_CLEANUP]) (node as any)[SEIDR_CLEANUP]();
    }
    ctx.fragmentChildren.delete(fragment);
  };

  fragment.remove = () => {
    const currentNodes = fragment.nodes;
    (fragment as any)[SEIDR_CLEANUP]();

    // Instead of just removing from DOM, move them back into the fragment bucket
    // to preserve them for potential re-attachment.
    fragment.appendChild(s);
    for (const node of currentNodes) {
      fragment.appendChild(node);
    }
    fragment.appendChild(e);

    // Clean up owners
    for (const node of currentNodes) {
      ctx.fragmentOwners.delete(node);
    }
    ctx.fragmentOwners.delete(s);
    ctx.fragmentOwners.delete(e);
  };

  fragment.toString = (): string => {
    const content = fragment.nodes.map((n: any) => n.toString()).join("");
    return `<!--s:${finalId}-->${content}<!--e:${finalId}-->`;
  };

  // Initial children
  for (const child of children) {
    if (child) {
      fragment.appendChild(child);
      ctx.fragmentOwners.set(child, fragment);
    }
  }

  // Hydration support: If markers already exist, track them and the nodes between them
  if (start && end && s.parentNode) {
    const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    const nodes = getRangeNodes();

    if (isProd) {
      // In production, elide the markers for hydration if they were found
      lastParent = s.parentNode;
      nextAnchor = e.nextSibling;
      ctx.fragmentChildren.set(fragment, nodes);
      s.remove();
      e.remove();
    }

    trackNodes([s, e, ...nodes]);
  }

  return fragment;
}
