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
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function onMounted(callback: OnMountedFunction) {
  if (!isFn(callback)) {
    if (process.env.NODE_ENV === "development") {
      console.trace("onMounted callback is not a function");
    }
    return;
  }

  const component = getComponentScope();
  if (!component) {
    throw new SeidrError("onMounted called outside of component");
  }
  component.onMounted(callback);
}
