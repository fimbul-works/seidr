import { type DerivedValue, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseCheckboxResult } from "./types.js";

export type CheckboxErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageProps<T> & {
    instance?: UseCheckboxResult;
  };

/**
 * CheckboxErrorMessage standalone component.
 */
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { instance: cb, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxErrorMessage requires an instance coordinator");
  }

  return FormControlErrorMessage(
    {
      instance: cb.formControl,
      ...cb.dataset,
      dataComponent: "checkbox",
      ...rest,
    } as FormControlErrorMessageProps<T>,
    children,
  );
}
