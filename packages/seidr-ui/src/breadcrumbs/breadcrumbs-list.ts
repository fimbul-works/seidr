import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_BREADCRUMBS, DATA_PART_LIST } from "../constants.js";
import type { BreadcrumbsListProps } from "./types.js";

/**
 * Ordered list container for breadcrumb items.
 */
export function BreadcrumbsList<T extends keyof SeidrElementTagNameMap = "ol">(
  propsOrChildren?: BreadcrumbsListProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BreadcrumbsListProps<T>>(propsOrChildren, children);
  const { as = "ol" as T, instance,...rest } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsList requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent: DATA_COMPONENT_BREADCRUMBS,
      dataPart: DATA_PART_LIST,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
