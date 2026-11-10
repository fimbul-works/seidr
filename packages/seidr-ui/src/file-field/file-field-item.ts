import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_ITEM } from "../constants.js";
import type { FileFieldItemProps } from "./types.js";

/**
 * Individual file row representation (role="listitem").
 */
export function FileFieldItem<T extends keyof SeidrElementTagNameMap = "li">(
  props: FileFieldItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "li" as T,
    file,
    instance,
    dataComponent = DATA_COMPONENT_FILE_FIELD,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldItem requires an instance coordinator");
  }

  if (!file) {
    throw new SeidrError("FileFieldItem requires a 'file' prop");
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
      role: "listitem",
      dataComponent,
      dataPart: DATA_PART_ITEM,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
