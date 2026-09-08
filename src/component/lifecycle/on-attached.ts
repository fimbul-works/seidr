import { SeidrError } from "../../types.js";
import type { OnAttachedFunction } from "../types.js";
import { getComponentScope } from "./component-scope.js";

/**
 * Map of nodes to their onAttached callbacks.
 */
export const onAttachedFns = new Map<Node, Array<OnAttachedFunction>>();

/**
 * Register a lifecycle hook that is called when a DOM node is attached to the document.
 * If the node is already connected to the document, the callback is executed immediately.
 *
 * @param {OnAttachedFunction} callback - Callback to invoke when attached to document
 * @param {Node} el - The target node
 * @throws {SeidrError} if called outside of component hierarchy without a target node
 */
export function onAttached(callback: OnAttachedFunction, el?: Node) {
  if (el) {
    if (el.isConnected) {
      callback();
      return;
    }

    let callbacks: OnAttachedFunction[] = [];
    if (onAttachedFns.has(el)) {
      callbacks = onAttachedFns.get(el)!;
    } else {
      onAttachedFns.set(el, callbacks);
    }

    callbacks.push(callback);
    return;
  }

  const component = getComponentScope();
  if (!component) {
    throw new SeidrError("onAttached called outside of component");
  }

  component.onAttach(callback);
}
