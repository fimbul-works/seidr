import {
  $,
  isValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { FileFieldItemNameProps } from "./types.js";

/**
 * File name display element.
 */
export function FileFieldItemName<T extends keyof SeidrElementTagNameMap = "span">(
  props: FileFieldItemNameProps<T> = {} as FileFieldItemNameProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    file,
    instance,
    dataComponent = "file-field",
    children: propsChildren,
    ...rest
  } = props;

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  if (resolvedChildren.length === 0 && file) {
    if (isValue<File>(file)) {
      resolvedChildren.push(file.as((f) => f?.name ?? ""));
    } else {
      resolvedChildren.push(unwrapValue(file)?.name ?? "");
    }
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "item-name",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

