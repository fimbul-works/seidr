import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  /**
   * The HTML element tag name to render.
   * @default "label"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;
}

export type NumberFieldLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = NumberFieldLabelOptions<T> &
  SeidrElementProps<T>;

/**
 * NumberFieldLabel provides the accessible label for the number field input.
 */
export function NumberFieldLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: NumberFieldLabelProps<T> = {} as NumberFieldLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: nf, dataComponent = "number-field", dataPart = "label", ...rest } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldLabel requires an instance coordinator");
  }

  return FormControlLabel(
    {
      instance: nf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlLabelProps<T>,
    children,
  );
}
