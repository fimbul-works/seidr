import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_TEXT_FIELD, DATA_PART_DESCRIPTION } from "../constants.js";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { TextFieldDescriptionProps } from "./types.js";

/**
 * TextFieldDescription subcomponent.
 */
export function TextFieldDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: TextFieldDescriptionProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: tf, dataComponent = DATA_COMPONENT_TEXT_FIELD, dataPart = DATA_PART_DESCRIPTION, ...rest } = props;

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
