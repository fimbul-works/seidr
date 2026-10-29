import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
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
  const { as = "span" as T, instance, dataComponent, dataPart, ...rest } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsSeparator requires an instance coordinator");
  }

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent: dataComponent ?? "breadcrumbs",
      dataPart: dataPart ?? "separator",
      ...rest,
    } as SeidrElementProps<T>,
    content !== undefined ? content : instance.separator,
  );
}
