import {
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  type Value,
} from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageProps<T> & { instance?: UseSwitchResult };

/**
 * SwitchErrorMessage standalone component.
 */
export function SwitchErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function SwitchErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function SwitchErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchErrorMessageProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchErrorMessage requires an instance prop");
  }

  return FormControlErrorMessage(
    { instance: sw.formControl, ...sw.dataset, ...rest } as FormControlErrorMessageProps<T>,
    content,
  );
}
