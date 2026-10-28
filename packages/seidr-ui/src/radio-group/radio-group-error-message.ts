import {
  type DerivedValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseRadioGroupResult } from "./types.js";

export interface RadioGroupErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit radio group instance providing reactive state.
   */
  instance?: UseRadioGroupResult;
}

export type RadioGroupErrorMessageProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RadioGroupErrorMessageOptions<T> & SeidrElementProps<T>;

/**
 * The error message displayed when the radio group is in an invalid state.
 */
export function RadioGroupErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function RadioGroupErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  props?: RadioGroupErrorMessageProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function RadioGroupErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: RadioGroupErrorMessageProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<RadioGroupErrorMessageProps<T>>(propsOrChildren, children);
  const { as = "span" as T, instance: rg, ...rest } = props;

  if (!rg) {
    throw new SeidrError("RadioGroupErrorMessage requires an instance prop");
  }

  return FormControlErrorMessage(
    { as, instance: rg.formControl, ...rg.dataset, ...rest } as FormControlErrorMessageProps<T>,
    content,
  );
}
