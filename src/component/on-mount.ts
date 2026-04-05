import { SeidrError } from "../types";
import { useScope } from "./use-scope";
import type { OnMountFunction } from "./types";

/**
 * Register a function to be executed when component is mounted.
 * @param {OnMountFunction} callback - Callback function
 *@param {boolean} [throwError=true] - Whether to throw an error when current component is no found (default: `true`)
 */
export const onMount = (callback: OnMountFunction, throwError = true): void => {
  const component = useScope();
  if (!component && throwError) {
    throw new SeidrError("onMount called outside of component");
  }
  component?.onMount(callback);
};
