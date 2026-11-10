import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_BREADCRUMBS, DATA_PART_ITEM } from "../constants.js";
import type { BreadcrumbsItemProps } from "./types.js";

/**
 * List item container for a single breadcrumb link and optional separator.
 */
export function BreadcrumbsItem<T extends keyof SeidrElementTagNameMap = "li">(
  propsOrChildren?: BreadcrumbsItemProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BreadcrumbsItemProps<T>>(propsOrChildren, children);
  const { as = "li" as T, instance, ...rest } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsItem requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent: DATA_COMPONENT_BREADCRUMBS,
      dataPart: DATA_PART_ITEM,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
