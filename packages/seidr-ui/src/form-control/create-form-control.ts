import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, type Value } from "@fimbul-works/seidr";
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
    propsOrChildren?: FormControlRootProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Label element.
   */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: FormControlLabelProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Description element.
   */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.ErrorMessage element.
   */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlErrorMessageProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a form control state instance with pre-bound compound element helpers.
 */
export function createFormControl(options: UseFormControlOptions = {}): FormControlInstance {
  const instance = useFormControl(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlRoot({ instance, ...props }, content);
    },
    Label: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlLabel({ instance, ...props }, content);
    },
    Description: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlDescription({ instance, ...props }, content);
    },
    ErrorMessage: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return FormControlErrorMessage({ instance, ...props }, content);
    },
  };
}
