import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
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
    dataComponent = "file-field",
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
      dataPart: "label",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
