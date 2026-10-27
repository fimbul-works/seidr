import { resolvePropsAndChildren } from "@fimbul-works/seidr";
import { FormControlDescription } from "../form-control/form-control-description.js";
import { FormControlErrorMessage } from "../form-control/form-control-error-message.js";
import { FormControlLabel } from "../form-control/form-control-label.js";
import { SwitchControl } from "./switch-control.js";
import { SwitchInput } from "./switch-input.js";
import { SwitchRoot } from "./switch-root.js";
import { SwitchThumb } from "./switch-thumb.js";
import type { SwitchInstance, UseSwitchOptions } from "./types.js";
import { useSwitch } from "./use-switch.js";

/**
 * Creates a switch state coordinator instance with pre-bound compound element helpers.
 */
export function createSwitch(options: UseSwitchOptions = {}): SwitchInstance {
  const instance = useSwitch(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return SwitchRoot({ instance, ...props }, content);
    },
    Input: (props = {}) => SwitchInput({ instance, ...props }),
    Control: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return SwitchControl({ instance, ...props }, content);
    },
    Thumb: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return SwitchThumb({ instance, ...props }, content);
    },
    Label: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlLabel({ instance: instance.formControl, ...instance.dataset, ...props }, content);
    },
    Description: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlDescription({ instance: instance.formControl, ...instance.dataset, ...props }, content);
    },
    ErrorMessage: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlErrorMessage({ instance: instance.formControl, ...instance.dataset, ...props }, content);
    },
  };
}
