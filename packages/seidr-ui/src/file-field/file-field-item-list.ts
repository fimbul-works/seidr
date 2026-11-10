import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_ITEM_LIST } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_FILE_FIELD,
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
      dataPart: DATA_PART_ITEM_LIST,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
