import { isFn } from "@fimbul-works/hvat";
import { getComponentScope } from "../component/component-scope.js";
import type { OnMountedFunction } from "../component/types.js";
import { SeidrError } from "../types.js";

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
    if (process.env.NODE_ENV !== "production") {
      throw new SeidrError("onMounted callback is not a function");
    }
    return;
  }

  const component = getComponentScope();
  if (!component) {
    if (process.env.VITEST) {
      console.warn("[seidr:error] onMounted called outside of component");
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      throw new SeidrError("onMounted called outside of component");
    }
    return;
  }
  component.onMounted(callback);
}
