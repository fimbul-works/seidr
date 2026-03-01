import { isTextNode } from "../util/type-guards/dom-node-types";

/**
 * Checks if a node is a whitespace-only text node that should be ignored during path calculation.
 */
export function isIgnorableWhitespace(node: Node): boolean {
  if (!isTextNode(node)) return false;
  const text = node.textContent || "";
  if (text.trim().length > 0) return false;

  // Check if we are inside a <pre> or <textarea> where whitespace matters
  let parent = node.parentElement;
  while (parent) {
    const tagName = parent.tagName.toLowerCase();
    if (tagName === "pre" || tagName === "textarea") return false;
    parent = parent.parentElement;
  }

  return true;
}

/**
 * Helper to compare nodes, considering possible proxies.
 */
function isSameNode(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const targetA = a.__target || a;
  const targetB = b.__target || b;
  return targetA === targetB;
}

/**
 * Calculates the relative DOM path from a root node to a target node.
 * If anchorSibling is provided (for fragments/markers), the first index is relative to that sibling.
 * Otherwise, the first index is relative to root.childNodes.
 *
 * @param {Node} root - The parent container or the root element itself
 * @param {Node} target - The node to find
 * @param {Node} [anchorSibling] - Optional starting sibling for relative counting (markers)
 * @returns {number[] | null} Array of child indices
 */
export function getRelativeDOMPath(root: Node, target: Node, anchorSibling?: Node): number[] | null {
  if (isSameNode(root, target)) return [];

  const path: number[] = [];
  let current: Node | null = target;

  while (current && !isSameNode(current, root)) {
    const parent: Node | null = current.parentNode;
    if (!parent) return null;

    // Find the index among non-ignorable siblings
    let index = 0;

    let siblingCursor = parent.firstChild;
    let found = false;

    // If we are at the level where anchorSibling exists
    if (anchorSibling && isSameNode(parent, anchorSibling.parentNode)) {
      siblingCursor = anchorSibling.nextSibling;
    }

    while (siblingCursor) {
      if (isSameNode(siblingCursor, current)) {
        found = true;
        break;
      }
      if (!isIgnorableWhitespace(siblingCursor)) {
        index++;
      }
      siblingCursor = siblingCursor.nextSibling;
    }

    if (!found) {
      return null;
    }

    path.unshift(index);
    current = parent;
  }

  return isSameNode(current, root) ? path : null;
}
