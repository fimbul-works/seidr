import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseCheckboxResult } from "./types.js";

export type CheckboxDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlDescriptionProps<T> & { instance?: UseCheckboxResult };

/**
 * CheckboxDescription standalone component.
 */
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxDescriptionProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance: cb, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxDescription requires an instance prop");
  }

  return FormControlDescription(
    { instance: cb.formControl, ...cb.dataset, ...rest } as FormControlDescriptionProps<T>,
    content,
  );
}
