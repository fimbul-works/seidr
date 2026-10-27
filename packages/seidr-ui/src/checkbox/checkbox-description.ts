import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseCheckboxResult } from "./types.js";

/**
 * CheckboxDescription standalone component.
 */
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props?: (FormControlDescriptionProps<T> & { instance?: UseCheckboxResult }) | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlDescription({ instance: form, ...(instance ? instance.dataset : {}), ...rest }, content);
}
