import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { FileFieldItemListProps } from "./types.js";

/**
 * List container for uploaded file items (role="list").
 */
export function FileFieldItemList<T extends keyof SeidrElementTagNameMap = "ul">(
  props: FileFieldItemListProps<T> = {} as FileFieldItemListProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    instance,
    dataComponent = "file-field",
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldItemList requires an instance coordinator");
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
      role: "list",
      dataComponent,
      dataPart: "item-list",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

