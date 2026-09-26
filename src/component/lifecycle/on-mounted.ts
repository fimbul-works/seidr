import { SeidrError } from "../../types.js";
import { isFn } from "../../util/type-guards.js";
import { getComponentScope } from "../component-scope.js";
import type { OnMountedFunction } from "../types.js";

/**
 * Map of nodes to their onMounted callbacks.
 */
export const onMountedFns = new Map<Node, Array<OnMountedFunction>>();

/**
 * Register a component lifecycle hook that is called when the component is mounted.
 *
 * @param {OnMountedFunction} callback - Callback to invoke when component is attached to DOM
 * @param {Node} el - The target node
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function onMounted(callback: OnMountedFunction, el?: Node) {
  if (!isFn(callback)) {
    if (process.env.NODE_ENV === "development") {
      console.trace("onMounted callback is not a function");
    }
    return;
  }

  // Handle element callbacks
  if (el) {
    if (el.isConnected) {
      callback();
    } else {
      const callbacks: OnMountedFunction[] = onMountedFns.has(el) ? onMountedFns.get(el)! : [];
      callbacks.push(callback);
      onMountedFns.set(el, callbacks);
    }
  } else {
    // Handle component callbacks
    const component = getComponentScope();
    if (!component) {
      throw new SeidrError("onMounted called outside of component");
    }
    component.onMounted(callback);
  }
}
