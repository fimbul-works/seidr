import { SeidrError } from "../types";
import { useScope } from "./component-stack/use-scope";

/**
 * Register a function to be executed when component tree is attached to DOM.
 * @param {() => void} callback - Callback function
 */
export const onAttached = (callback: () => void): void => {
  const component = useScope();
  if (!component) {
    throw new SeidrError("onAttached called outside of component");
  }
  component.onAttached(callback);
};
