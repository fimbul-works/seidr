import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "./form-control-description.js";
import { FormControlErrorMessage, type FormControlErrorMessageProps } from "./form-control-error-message.js";
import { FormControlLabel, type FormControlLabelProps } from "./form-control-label.js";
import { FormControlRoot, type FormControlRootProps } from "./form-control-root.js";
import type { UseFormControlOptions, UseFormControlResult } from "./types.js";
import { useFormControl } from "./use-form-control.js";

export interface FormControlInstance extends UseFormControlResult {
  /**
   * Pre-bound FormControl.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FormControlRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Label element.
   */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: FormControlLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Description element.
   */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FormControlDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.ErrorMessage element.
   */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FormControlErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a form control state instance with pre-bound compound element helpers.
 */
export function createFormControl(options: UseFormControlOptions = {}): FormControlInstance {
  const instance = useFormControl(options);

  return {
    ...instance,
    Root: (props = {}, children) => FormControlRoot({ instance, ...props }, children),
    Label: (props = {}, children) => FormControlLabel({ instance, ...instance.dataset, ...props }, children),
    Description: (props = {}, children) => FormControlDescription({ instance, ...instance.dataset, ...props }, children),
    ErrorMessage: (props = {}, children) => FormControlErrorMessage({ instance, ...instance.dataset, ...props }, children),
  };
}
