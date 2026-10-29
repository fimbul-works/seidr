import { type DerivedValue, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { TextFieldErrorMessageProps } from "./types.js";

/**
 * TextFieldErrorMessage subcomponent, conditionally rendered when validationState is "invalid".
 */
export function TextFieldErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: TextFieldErrorMessageProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { instance: tf, dataComponent = "text-field", dataPart = "error-message", ...rest } = props;

  if (!tf) {
    throw new SeidrError("TextFieldErrorMessage requires an instance coordinator");
  }

  return FormControlErrorMessage(
    {
      instance: tf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlErrorMessageProps<T>,
    children,
  );
}
