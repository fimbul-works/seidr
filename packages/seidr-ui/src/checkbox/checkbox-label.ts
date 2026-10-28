import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseCheckboxResult } from "./types.js";

export type CheckboxLabelProps<T extends keyof SeidrElementTagNameMap> = FormControlLabelProps<T> & {
  instance?: UseCheckboxResult;
};

/**
 * CheckboxLabel standalone component.
 */
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: CheckboxLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: CheckboxLabelProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance: cb, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxLabel requires an instance prop");
  }

  return FormControlLabel({ instance: cb.formControl, ...cb.dataset, ...rest } as FormControlLabelProps<T>, content);
}
