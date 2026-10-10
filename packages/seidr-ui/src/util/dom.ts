import { isClient, SeidrError } from "@fimbul-works/seidr";

/**
 * Get the owner window of a node.
 * @param element The node to get the owner window of.
 * @returns The owner window of the node.
 *
 * Lifted from https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export function getOwnerWindow(element?: Node | null) {
  if (!isClient()) {
    throw new SeidrError("Cannot access window outside of the DOM");
  }

  return element?.ownerDocument?.defaultView ?? window;
}

/**
 * Get the owner document of a node.
 * @param element The node to get the owner document of.
 * @returns The owner document of the node.
 *
 * Lifted from https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export function getOwnerDocument(element?: Node | null) {
  if (!isClient()) {
    throw new SeidrError("Cannot access document outside of the DOM");
  }

  return element?.ownerDocument ?? document;
}

/**
 * Get the active element in the DOM.
 * @param node The node to get the active element of.
 * @param activeDescendant Whether to get the active descendant of the active element.
 * @returns The active element in the DOM.
 *
 * Lifted from https://github.com/ariakit/ariakit/blob/main/packages/ariakit-core/src/utils/dom.ts#L37
 * MIT License, Copyright (c) AriaKit.
 */
export function getActiveElement(node?: Node | null, activeDescendant = false): HTMLElement | null {
  const doc = getOwnerDocument(node);
  const activeElement = doc.activeElement;

  if (!activeElement?.nodeName) {
    // `activeElement` might be an empty object if we're interacting with elements
    // inside of an iframe.
    return null;
  }

  const isFrame = (element: Element): element is HTMLIFrameElement => element.tagName === "IFRAME";

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
