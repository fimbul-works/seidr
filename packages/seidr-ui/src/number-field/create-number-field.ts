import type { SeidrChild } from "@fimbul-works/seidr";
import {
  NumberFieldDecrementTrigger,
  type NumberFieldDecrementTriggerProps,
} from "./number-field-decrement-trigger.js";
import { NumberFieldDescription, type NumberFieldDescriptionProps } from "./number-field-description.js";
import { NumberFieldErrorMessage, type NumberFieldErrorMessageProps } from "./number-field-error-message.js";
import { NumberFieldHiddenInput, type NumberFieldHiddenInputProps } from "./number-field-hidden-input.js";
import {
  NumberFieldIncrementTrigger,
  type NumberFieldIncrementTriggerProps,
} from "./number-field-increment-trigger.js";
import { NumberFieldInput, type NumberFieldInputProps } from "./number-field-input.js";
import { NumberFieldLabel, type NumberFieldLabelProps } from "./number-field-label.js";
import { NumberFieldRoot, type NumberFieldRootProps } from "./number-field-root.js";
import type { NumberFieldInstance, UseNumberFieldOptions } from "./types.js";
import { useNumberField } from "./use-number-field.js";

/**
 * Creates a NumberField state coordinator instance with pre-bound compound element helpers.
 */
export function createNumberField(options: UseNumberFieldOptions = {}): NumberFieldInstance {
  const instance = useNumberField(options);

  return {
    ...instance,
    Root: (props: NumberFieldRootProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldRoot({ instance, ...props }, children),
    Input: (props: NumberFieldInputProps<any> = {}) => NumberFieldInput({ instance, ...props }),
    IncrementTrigger: (props: NumberFieldIncrementTriggerProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldIncrementTrigger({ instance, ...props }, children),
    DecrementTrigger: (props: NumberFieldDecrementTriggerProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldDecrementTrigger({ instance, ...props }, children),
    HiddenInput: (props: NumberFieldHiddenInputProps = {}) => NumberFieldHiddenInput({ instance, ...props }),
    Label: (props: NumberFieldLabelProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldLabel({ instance, ...props }, children),
    Description: (props: NumberFieldDescriptionProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldDescription({ instance, ...props }, children),
    ErrorMessage: (props: NumberFieldErrorMessageProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      NumberFieldErrorMessage({ instance, ...props }, children),
  };
}
