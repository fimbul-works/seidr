/*
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/232bc79018ec20967fec1e097a9474aba3bb5be7/packages/ariakit-utils/src/dom.ts
 */
import { getDocument, isClient, SeidrError } from "@fimbul-works/seidr";

/**
 * Check if a node is contained within another node (inclusive of the node itself).
 *
 * Similar to `Element.prototype.contains`, but a little faster when `element` is the same as `child`.
 *
 * @param parent - The potential parent node.
 * @param child - The potential child node.
 * @returns `true` if `parent` contains `child`, `false` otherwise.
 */
export function contains(parent: Node | undefined, child: Node | null): boolean {
  return !parent ? false : parent === child || parent.contains(child);
}

/**
 * Get the owner window of a node.
 * @param element The node to get the owner window of.
 * @returns The owner window of the node.
 */
export function getOwnerWindow(element?: Node | null): Window {
  if (!isClient()) {
    throw new SeidrError("Cannot access window outside of the DOM");
  }

  return element?.ownerDocument?.defaultView ?? window;
}

/**
 * Get the owner document of a node.
 * @param element The node to get the owner document of.
 * @returns The owner document of the node.
 */
export function getOwnerDocument(element?: Node | null): Document {
  return element?.ownerDocument ?? getDocument();
}

export const isFrame = (element: Element): element is HTMLIFrameElement => element.tagName === "IFRAME";

/**
 * Get the active element in the DOM.
 * @param node The node to get the active element of.
 * @param activeDescendant Whether to get the active descendant of the active element.
 * @returns The active element in the DOM.
 */
export function getActiveElement(node?: Node | null, activeDescendant = false): HTMLElement | null {
  const doc = getOwnerDocument(node);
  const activeElement = doc.activeElement;

  if (!activeElement?.nodeName) {
    // activeElement might be an empty object if we're interacting with elements
    // inside of an iframe
    return null;
  }

  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(activeElement.contentDocument.body, activeDescendant);
  }

  if (activeDescendant) {
    const id = activeElement.getAttribute("aria-activedescendant");
    if (id) {
      const element = doc.getElementById(id);
      if (element) {
        return element;
      }
    }
  }

  return activeElement as HTMLElement;
}
