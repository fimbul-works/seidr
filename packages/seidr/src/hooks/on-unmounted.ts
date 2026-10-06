import { getComponentScope } from "../component/component-scope.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isFn } from "../util/type-guards.js";

/**
 * Register a component lifecycle hook that is called when the component is unmounted.
 *
 * @param {CleanupFunction} callback - Callback to invoke when component is removed from DOM
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function onUnmounted(callback: CleanupFunction) {
  if (!isFn(callback)) {
    if (process.env.NODE_ENV === "development") {
      console.trace("onUnmounted callback is not a function");
    }
    return;
  }

  const component = getComponentScope();
  if (!component) {
    throw new SeidrError("onUnmounted called outside of component");
  }
  component.onUnmounted(callback);
}
