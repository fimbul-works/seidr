import { SwitchControl } from "./switch-control.js";
import { SwitchInput } from "./switch-input.js";
import { SwitchRoot } from "./switch-root.js";
import { SwitchThumb } from "./switch-thumb.js";
import { SwitchLabel } from "./switch-label.js";
import { SwitchDescription } from "./switch-description.js";
import { SwitchErrorMessage } from "./switch-error-message.js";
import type { SwitchInstance, UseSwitchOptions } from "./types.js";
import { useSwitch } from "./use-switch.js";

/**
 * Creates a switch state coordinator instance with pre-bound compound element helpers.
 */
export function createSwitch(options: UseSwitchOptions = {}): SwitchInstance {
  const instance = useSwitch(options);

  return {
    ...instance,
    Root: (props, children) => {
      return SwitchRoot({ instance, ...props }, children);
    },
    Input: (props = {}) => SwitchInput({ instance, ...props }),
    Control: (props, children) => {
      return SwitchControl({ instance, ...props }, children);
    },
    Thumb: (props, children) => {
      return SwitchThumb({ instance, ...props }, children);
    },
    Label: (props, children) => {
      return SwitchLabel({ instance, ...instance.dataset, ...props }, children);
    },
    Description: (props, children) => {
      return SwitchDescription({ instance, ...instance.dataset, ...props }, children);
    },
    ErrorMessage: (props, children) => {
      return SwitchErrorMessage({ instance, ...instance.dataset, ...props }, children);
    },
  };
}
