import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TimeFieldErrorMessageProps } from "./types.js";

/**
 * Error message element for the TimeField component.
 */
export function TimeFieldErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  props: TimeFieldErrorMessageProps<T> = {} as TimeFieldErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    dataComponent = "time-field",
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldErrorMessage requires an instance coordinator");
  }

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  return $(
    as,
    {
      id: customId ?? instance.formControl.errorMessageId,
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart: "error-message",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

