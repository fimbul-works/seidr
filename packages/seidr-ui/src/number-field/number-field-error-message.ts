import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;
}

export type NumberFieldErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  NumberFieldErrorMessageOptions<T> & SeidrElementProps<T>;

/**
 * NumberFieldErrorMessage displays validation feedback when the number field is invalid.
 */
export function NumberFieldErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: NumberFieldErrorMessageProps<T> = {} as NumberFieldErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { instance: nf, dataComponent = "number-field", dataPart = "error-message", ...rest } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldErrorMessage requires an instance coordinator");
  }

  return FormControlErrorMessage(
    {
      instance: nf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlErrorMessageProps<T>,
    children,
  );
}
