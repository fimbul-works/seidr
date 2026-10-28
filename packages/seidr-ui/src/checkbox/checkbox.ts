import type { SeidrChild } from "@fimbul-works/seidr";
import { CheckboxControl, type CheckboxControlProps } from "./checkbox-control.js";
import { CheckboxDescription, type CheckboxDescriptionProps } from "./checkbox-description.js";
import { CheckboxErrorMessage, type CheckboxErrorMessageProps } from "./checkbox-error-message.js";
import { CheckboxIndicator, type CheckboxIndicatorProps } from "./checkbox-indicator.js";
import { CheckboxInput, type CheckboxInputProps } from "./checkbox-input.js";
import { CheckboxLabel, type CheckboxLabelProps } from "./checkbox-label.js";
import { CheckboxRoot, type CheckboxRootProps } from "./checkbox-root.js";
import { createCheckbox } from "./create-checkbox.js";
import type { UseCheckboxOptions } from "./types.js";

export interface CheckboxProps extends UseCheckboxOptions {
  /** Optional class name for the root container. */
  className?: string;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Optional custom indicator element. Defaults to checkmark. */
  indicator?: SeidrChild | SeidrChild[];

  /** Props passed to Checkbox.Root. */
  rootProps?: CheckboxRootProps<any>;

  /** Props passed to Checkbox.Input. */
  inputProps?: CheckboxInputProps;

  /** Props passed to Checkbox.Control. */
  controlProps?: CheckboxControlProps<any>;

  /** Props passed to Checkbox.Indicator. */
  indicatorProps?: CheckboxIndicatorProps<any>;

  /** Props passed to Checkbox.Label. */
  labelProps?: CheckboxLabelProps<any>;

  /** Props passed to Checkbox.Description. */
  descriptionProps?: CheckboxDescriptionProps<any>;

  /** Props passed to Checkbox.ErrorMessage. */
  errorMessageProps?: CheckboxErrorMessageProps<any>;
}

/**
 * Checkbox component.
 */
function CheckboxComponent(options: CheckboxProps = {}) {
  const {
    className,
    label,
    description,
    errorMessage,
    indicator,
    rootProps = {},
    inputProps = {},
    controlProps = {},
    indicatorProps = {},
    labelProps = {},
    descriptionProps = {},
    errorMessageProps = {},
    ...checkboxOptions
  } = options;

  const cb = createCheckbox(checkboxOptions);

  return cb.Root({ className, ...rootProps } as CheckboxRootProps, [
    cb.Input(inputProps),
    cb.Control(controlProps, [cb.Indicator(indicatorProps, indicator ?? "✓")]),
    label ? cb.Label(labelProps, label) : null,
    description ? cb.Description(descriptionProps, description) : null,
    errorMessage ? cb.ErrorMessage(errorMessageProps, errorMessage) : null,
  ]);
}

export const Checkbox = Object.assign(CheckboxComponent, {
  create: createCheckbox,
  Root: CheckboxRoot,
  Input: CheckboxInput,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Description: CheckboxDescription,
  ErrorMessage: CheckboxErrorMessage,
});
