import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_PART_SEPARATOR } from "../constants.js";
import type { TimeFieldSeparatorProps } from "./types.js";

/**
 * Visual separator (e.g. ":") between time segments.
 */
export function TimeFieldSeparator<T extends keyof SeidrElementTagNameMap = "span">(
  props: TimeFieldSeparatorProps<T> = {} as TimeFieldSeparatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance, dataComponent = "time-field", children: propsChildren, ...rest } = props;

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  if (resolvedChildren.length === 0) {
    resolvedChildren.push(":");
  }

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent,
      dataPart: DATA_PART_SEPARATOR,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
