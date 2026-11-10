import { type DerivedValue, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_TEXT_FIELD, DATA_PART_ERROR_MESSAGE } from "../constants.js";
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
  const { instance: tf, dataComponent = DATA_COMPONENT_TEXT_FIELD, dataPart = DATA_PART_ERROR_MESSAGE, ...rest } = props;

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
