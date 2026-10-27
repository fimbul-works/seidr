import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseCheckboxResult } from "./types.js";

/**
 * CheckboxLabel standalone component.
 */
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props?: (FormControlLabelProps<T> & { instance?: UseCheckboxResult }) | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlLabel({ instance: form, ...(instance ? instance.dataset : {}), ...rest }, content);
}
