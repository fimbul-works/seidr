import {
  $,
  type DerivedValue,
  isValue,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  Show,
  unwrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_ITEM_PREVIEW } from "../constants.js";
import type { FileFieldItemPreviewProps } from "./types.js";

/**
 * Conditionally renders content if the file matches a specified MIME type pattern.
 */
export function FileFieldItemPreview<T extends keyof SeidrElementTagNameMap = "div">(
  props: FileFieldItemPreviewProps<T> = {} as FileFieldItemPreviewProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    file,
    type = ".*",
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

  const isMatched = mergeValues(
    () => {
      const f = unwrapValue(file);
      if (!f) return false;
      return !!f.type.match(type);
    },
    { parents: isValue(file) ? [file] : [] },
  );

  const renderEl = () =>
    $(
      as,
      {
        dataComponent,
        dataPart: DATA_PART_ITEM_PREVIEW,
        ...rest,
      } as SeidrElementProps<T>,
      resolvedChildren,
    );

  return Show(isMatched, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
