import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_TEXT_FIELD, DATA_PART_LABEL } from "../constants.js";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { TextFieldLabelProps } from "./types.js";

/**
 * TextFieldLabel subcomponent linking to the input element.
 */
export function TextFieldLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: TextFieldLabelProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: tf, dataComponent = DATA_COMPONENT_TEXT_FIELD, dataPart = DATA_PART_LABEL, ...rest } = props;

  if (!tf) {
    throw new SeidrError("TextFieldLabel requires an instance coordinator");
  }

  return FormControlLabel(
    {
      instance: tf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlLabelProps<T>,
    children,
  );
}
