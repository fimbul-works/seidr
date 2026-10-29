import type { SeidrChild } from "@fimbul-works/seidr";
import { type CheckboxControlProps } from "./checkbox-control.js";
import { type CheckboxDescriptionProps } from "./checkbox-description.js";
import { type CheckboxErrorMessageProps } from "./checkbox-error-message.js";
import { type CheckboxIndicatorProps } from "./checkbox-indicator.js";
import { type CheckboxInputProps } from "./checkbox-input.js";
import { type CheckboxLabelProps } from "./checkbox-label.js";
import { type CheckboxRootProps } from "./checkbox-root.js";
import { createCheckbox } from "./create-checkbox.js";
import type { UseCheckboxOptions } from "./types.js";
import { createComponent } from "@fimbul-works/seidr";

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
  rootProps?: CheckboxRootProps;

  /** Props passed to Checkbox.Input. */
  inputProps?: CheckboxInputProps;

  /** Props passed to Checkbox.Control. */
  controlProps?: CheckboxControlProps;

  /** Props passed to Checkbox.Indicator. */
  indicatorProps?: CheckboxIndicatorProps;

  /** Props passed to Checkbox.Label. */
  labelProps?: CheckboxLabelProps;

  /** Props passed to Checkbox.Description. */
  descriptionProps?: CheckboxDescriptionProps;

  /** Props passed to Checkbox.ErrorMessage. */
  errorMessageProps?: CheckboxErrorMessageProps;
}

/**
 * Checkbox component.
 */
export const Checkbox = createComponent((props: CheckboxProps = {}) => {
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
  } = props;

  const cb = createCheckbox(checkboxOptions);

  return cb.Root({ className, ...rootProps } as CheckboxRootProps, [
    cb.Input(inputProps),
    cb.Control(controlProps, cb.Indicator(indicatorProps, indicator ?? "✓")),
    label ? cb.Label(labelProps, label) : null,
    description ? cb.Description(descriptionProps, description) : null,
    errorMessage ? cb.ErrorMessage(errorMessageProps, errorMessage) : null,
  ]);
}, "Checkbox");
