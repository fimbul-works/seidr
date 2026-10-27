import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, type Value } from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseCheckboxResult } from "./types.js";

/**
 * CheckboxErrorMessage standalone component.
 */
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props?: (FormControlErrorMessageProps<T> & { instance?: UseCheckboxResult }) | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlErrorMessage({ instance: form, ...(instance ? instance.dataset : {}), ...rest }, content);
}
