import {
  $,
  isValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_ITEM_NAME } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_FILE_FIELD,
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
      dataPart: DATA_PART_ITEM_NAME,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
