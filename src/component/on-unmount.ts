import { type CleanupFunction, SeidrError } from "../types";
import { useScope } from "./use-scope";

/**
 * Register a function to be executed when component is unmounted.
 * @param {OnMountCallback} callback
 *@param {boolean} [throwError=true] - Whether to throw an error when current component is no found (default: `true`)
 */
export const onUnmount = (callback: CleanupFunction, throwError = true): void => {
  const component = useScope();
  if (!component && throwError) {
    throw new SeidrError("onUnmount called outside of component");
  }
  component?.onUnmount(callback);
};
