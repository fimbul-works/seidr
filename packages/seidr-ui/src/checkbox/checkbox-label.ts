import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseFormControlResult } from "../form-control/types.js";
import type { UseCheckboxResult } from "./types.js";

export type CheckboxLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = FormControlLabelProps<T> & {
  instance?: UseCheckboxResult;
  formControl?: UseFormControlResult;
};

/**
 * CheckboxLabel standalone component.
 */
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: CheckboxLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: cb, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxLabel requires an instance coordinator");
  }

  return FormControlLabel(
    {
      instance: cb.formControl,
      ...cb.dataset,
      dataComponent: "checkbox",
      ...rest,
    } as FormControlLabelProps<T>,
    children,
  );
}
