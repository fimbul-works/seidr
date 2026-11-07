import {
  $,
  isValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { FileFieldItemSizeProps } from "./types.js";
import { DEFAULT_FILE_FIELD_INTL, formatBytes } from "./util.js";

/**
 * File size display element formatted with localized units.
 */
export function FileFieldItemSize<T extends keyof SeidrElementTagNameMap = "span">(
  props: FileFieldItemSizeProps<T> = {} as FileFieldItemSizeProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    file,
    precision = 2,
    instance,
    dataComponent = "file-field",
    children: propsChildren,
    ...rest
  } = props;

  const translations = instance?.translations ?? DEFAULT_FILE_FIELD_INTL;

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
      resolvedChildren.push(
        file.as((f) => (f ? formatBytes(f.size, precision, translations) : "")),
      );
    } else {
      const rawFile = unwrapValue(file);
      if (rawFile) {
        resolvedChildren.push(formatBytes(rawFile.size, precision, translations));
      }
    }
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "item-size",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

