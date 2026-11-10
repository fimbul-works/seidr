import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_ERROR_MESSAGE } from "../constants.js";
import type { FileFieldErrorMessageProps } from "./types.js";

/**
 * Error message element for the FileField component.
 */
export function FileFieldErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  props: FileFieldErrorMessageProps<T> = {} as FileFieldErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    dataComponent = DATA_COMPONENT_FILE_FIELD,
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldErrorMessage requires an instance coordinator");
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
      dataPart: DATA_PART_ERROR_MESSAGE,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
