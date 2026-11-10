import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_LABEL } from "../constants.js";
import type { FileFieldLabelProps } from "./types.js";

/**
 * Label element associated with the FileField's hidden input.
 */
export function FileFieldLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: FileFieldLabelProps<T> = {} as FileFieldLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "label" as T,
    instance,
    dataComponent = DATA_COMPONENT_FILE_FIELD,
    for: userFor,
    htmlFor: userHtmlFor,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldLabel requires an instance coordinator");
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
      for: userFor ?? userHtmlFor ?? instance.inputId,
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: DATA_PART_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
