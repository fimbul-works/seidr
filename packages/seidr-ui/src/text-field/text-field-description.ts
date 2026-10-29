import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { TextFieldDescriptionProps } from "./types.js";

/**
 * TextFieldDescription subcomponent.
 */
export function TextFieldDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: TextFieldDescriptionProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: tf, dataComponent = "text-field", dataPart = "description", ...rest } = props;

  if (!tf) {
    throw new SeidrError("TextFieldDescription requires an instance coordinator");
  }

  return FormControlDescription(
    {
      instance: tf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlDescriptionProps<T>,
    children,
  );
}
