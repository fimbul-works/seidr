import { type CleanupFunction, SeidrError } from "../../types.js";
import { isFn } from "../../util/type-guards.js";
import { getComponentScope } from "../component-scope.js";

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
  if (!isFn(callback)) return;

  // Handle element callbacks
  if (el) {
    const callbacks: CleanupFunction[] = onUnmountedFns.has(el) ? onUnmountedFns.get(el)! : [];
    callbacks.push(callback);
    onUnmountedFns.set(el, callbacks);
  } else {
    // Handle component callbacks
    const component = getComponentScope();
    if (!component) {
      throw new SeidrError("onUnmounted called outside of component");
    }
    component.onUnmounted(callback);
  }
}
