import { isFn } from "@fimbul-works/hvat";
import { getComponentScope } from "../component/component-scope.js";
import { type CleanupFunction, SeidrError } from "../types.js";

/**
 * Register a component lifecycle hook that is called when the component is unmounted.
 *
 * @param {CleanupFunction} callback - Callback to invoke when component is removed from DOM
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function onUnmounted(callback: CleanupFunction) {
  if (!isFn(callback)) {
    if (process.env.NODE_ENV !== "production") {
      throw new SeidrError("onUnmounted callback is not a function");
    }
    return;
  }

  const component = getComponentScope();
  if (!component) {
    if (process.env.VITEST) {
      console.warn("[seidr:error] onUnmounted called outside of component");
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      throw new SeidrError("onUnmounted called outside of component");
    }
    return;
  }
  component.onUnmounted(callback);
}
