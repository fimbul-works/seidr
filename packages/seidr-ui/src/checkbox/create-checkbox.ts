import { resolvePropsAndChildren } from "@fimbul-works/seidr";
import { FormControlDescription } from "../form-control/form-control-description.js";
import { FormControlErrorMessage } from "../form-control/form-control-error-message.js";
import { FormControlLabel } from "../form-control/form-control-label.js";
import { CheckboxControl } from "./checkbox-control.js";
import { CheckboxIndicator } from "./checkbox-indicator.js";
import { CheckboxInput } from "./checkbox-input.js";
import { CheckboxRoot } from "./checkbox-root.js";
import type { CheckboxInstance, UseCheckboxOptions } from "./types.js";
import { useCheckbox } from "./use-checkbox.js";

/**
 * Creates a checkbox state coordinator instance with pre-bound compound element helpers.
 */
export function createCheckbox(options: UseCheckboxOptions = {}): CheckboxInstance {
  const instance = useCheckbox(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CheckboxRoot({ instance, ...props }, content);
    },
    Input: (props = {}) => CheckboxInput({ instance, ...props }),
    Control: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CheckboxControl({ instance, ...props }, content);
    },
    Indicator: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CheckboxIndicator({ instance, ...props }, content);
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
