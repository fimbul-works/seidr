import { type CleanupFunction, SeidrError } from "../types";
import { getCurrentComponent } from "./component-stack";

/**
 * Register a function to be executed when component is unmounted.
 * @param {OnMountCallback} callback
 *@param {boolean} [throwError=true] - Whether to throw an error when current component is no found (default: `true`)
 */
export const onUnmount = (callback: CleanupFunction, throwError = true): void => {
  const component = getCurrentComponent();
  if (!component && throwError) {
    throw new SeidrError("onUnmount called outside of component");
  }
  component?.onUnmount(callback);
};
