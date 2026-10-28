import { CheckboxControl } from "./checkbox-control.js";
import { CheckboxIndicator } from "./checkbox-indicator.js";
import { CheckboxInput } from "./checkbox-input.js";
import { CheckboxRoot } from "./checkbox-root.js";
import type { CheckboxInstance, UseCheckboxOptions } from "./types.js";
import { useCheckbox } from "./use-checkbox.js";
import { CheckboxLabel } from "./checkbox-label.js";
import { CheckboxDescription } from "./checkbox-description.js";
import { CheckboxErrorMessage } from "./checkbox-error-message.js";

/**
 * Creates a checkbox state coordinator instance with pre-bound compound element helpers.
 */
export function createCheckbox(options: UseCheckboxOptions = {}): CheckboxInstance {
  const instance = useCheckbox(options);

  return {
    ...instance,
    Root: (props, children) => {
      return CheckboxRoot({ instance, ...props }, children);
    },
    Input: (props = {}) => CheckboxInput({ instance, ...props }),
    Control: (props, children) => {
      return CheckboxControl({ instance, ...props }, children);
    },
    Indicator: (props, children) => {
      return CheckboxIndicator({ instance, ...props }, children);
    },
    Label: (props, children) => {
      return CheckboxLabel({ instance, ...instance.dataset, ...props }, children);
    },
    Description: (props, children) => {
      return CheckboxDescription({ instance, ...instance.dataset, ...props }, children);
    },
    ErrorMessage: (props, children) => {
      return CheckboxErrorMessage({ instance, ...instance.dataset, ...props }, children);
    },
  };
}
