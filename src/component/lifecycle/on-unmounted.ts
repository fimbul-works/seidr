import { type CleanupFunction, SeidrError } from "../../types.js";
import { getComponentScope } from "./component-scope.js";

/**
 * Map of nodes to their onUnmounted callbacks.
 */
export const onUnmountedFns = new Map<Node, Array<CleanupFunction>>();

/**
 * Register a component lifecycle hook that is called when the component is unmounted.
 *
 * @param {CleanupFunction} callback - Callback to invoke when component is removed from DOM
 * @param {Node} el - The target node
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function onUnmounted(callback: CleanupFunction, el?: Node) {
  if (el) {
    let callbacks: CleanupFunction[] = [];
    if (onUnmountedFns.has(el)) {
      callbacks = onUnmountedFns.get(el)!;
    } else {
      onUnmountedFns.set(el, callbacks);
    }
    callbacks.push(callback);
    return;
  }

  const component = getComponentScope();
  if (!component) {
    throw new SeidrError("onUnmounted called outside of component");
  }

  component.onUnmount(callback);
}
