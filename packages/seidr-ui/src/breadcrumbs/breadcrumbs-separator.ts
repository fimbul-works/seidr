import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_BREADCRUMBS, DATA_PART_SEPARATOR } from "../constants.js";
import type { BreadcrumbsSeparatorProps } from "./types.js";

/**
 * Visual separator element displayed between breadcrumb items.
 * Marked with aria-hidden="true" so screen readers ignore it.
 */
export function BreadcrumbsSeparator<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: BreadcrumbsSeparatorProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BreadcrumbsSeparatorProps<T>>(propsOrChildren, children);
  const { as = "span" as T, instance, ...rest } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsSeparator requires an instance coordinator");
  }

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent: DATA_COMPONENT_BREADCRUMBS,
      dataPart: DATA_PART_SEPARATOR,
      ...rest,
    } as SeidrElementProps<T>,
    content !== undefined ? content : instance.separator,
  );
}
