import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseCheckboxResult } from "./types.js";

export type CheckboxDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlDescriptionProps<T> & { instance?: UseCheckboxResult };

/**
 * CheckboxDescription standalone component.
 */
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: cb, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxDescription requires an instance coordinator");
  }

  return FormControlDescription(
    { instance: cb.formControl, ...cb.dataset, dataComponent: "checkbox", ...rest } as FormControlDescriptionProps<T>,
    children,
  );
}
