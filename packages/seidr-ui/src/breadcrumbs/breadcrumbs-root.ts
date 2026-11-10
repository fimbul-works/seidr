import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_BREADCRUMBS } from "../constants.js";
import type { BreadcrumbsRootProps } from "./types.js";

/**
 * Navigation landmark container for breadcrumbs.
 */
export function BreadcrumbsRoot<T extends keyof SeidrElementTagNameMap = "nav">(
  propsOrChildren?: BreadcrumbsRootProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BreadcrumbsRootProps<T>>(propsOrChildren, children);
  const { as = "nav" as T, instance, ariaLabel, ...rest } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      ariaLabel: ariaLabel ?? instance.ariaLabel,
      dataComponent: DATA_COMPONENT_BREADCRUMBS,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
