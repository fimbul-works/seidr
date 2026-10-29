import { isArr } from "@fimbul-works/hvat";
import { createComponent, isValue, List, mergeValues, type SeidrChild, Show, unwrapValue } from "@fimbul-works/seidr";
import { createBreadcrumbs } from "./create-breadcrumbs.js";
import type {
  BreadcrumbItemDescriptor,
  BreadcrumbsLinkProps,
  BreadcrumbsProps,
  BreadcrumbsRootProps,
} from "./types.js";

/**
 * Unified all-in-one Breadcrumbs component.
 * Creates an accessible breadcrumb navigation hierarchy with WAI-ARIA compliance.
 */
export const Breadcrumbs = createComponent((props: BreadcrumbsProps = {}, children?: SeidrChild | SeidrChild[]) => {
  const { id, separator = "/", ariaLabel = "Breadcrumbs", items, className, rootProps = {}, listProps = {} } = props;

  const breadcrumbs = createBreadcrumbs({
    id,
    separator,
    ariaLabel,
  });

  if (children !== undefined) {
    return breadcrumbs.Root(
      {
        className,
        ...rootProps,
      } as BreadcrumbsRootProps<"nav">,
      children,
    );
  }

  let listChildren: SeidrChild | SeidrChild[] = [];

  if (isValue<BreadcrumbItemDescriptor[]>(items)) {
    const getKey = (item: BreadcrumbItemDescriptor) => unwrapValue(item.href) ?? String(item.label);

    listChildren = List(items, getKey, (itemVal) => {
      const isLast = mergeValues(
        () => {
          const arr = items();
          if (!arr || arr.length === 0) return true;
          return getKey(arr[arr.length - 1]) === getKey(itemVal());
        },
        {
          parents: [items, itemVal],
        },
      );

      const currentVal = mergeValues(
        () => {
          const item = itemVal();
          if (item.current !== undefined) {
            return !!unwrapValue(item.current);
          }
          return isLast();
        },
        {
          parents: [itemVal, isLast],
        },
      );

      const linkEl = breadcrumbs.Link(
        {
          as: itemVal().as,
          href: itemVal().href,
          current: currentVal,
          disabled: itemVal().disabled,
          ariaCurrent: itemVal().ariaCurrent,
          onclick: itemVal().onclick,
          ...(itemVal().linkProps ?? {}),
        } as BreadcrumbsLinkProps<any>,
        itemVal().label,
      );

      const separatorEl = Show(
        isLast.as((last) => !last),
        () => breadcrumbs.Separator(),
      );

      return breadcrumbs.Item(itemVal().itemProps ?? {}, [linkEl, separatorEl as SeidrChild]);
    });
  } else if (isArr(items)) {
    listChildren = items.map((item, index) => {
      const isLast = index === items.length - 1;
      const { href, label, current, disabled, ariaCurrent, as, itemProps, linkProps, onclick } = item;

      const linkEl = breadcrumbs.Link(
        {
          as,
          href,
          current: current ?? isLast,
          disabled,
          ariaCurrent,
          onclick,
          ...(linkProps ?? {}),
        } as BreadcrumbsLinkProps<any>,
        label,
      );

      return breadcrumbs.Item(itemProps ?? {}, [isLast ? linkEl : [linkEl, breadcrumbs.Separator()]]);
    });
  }

  return breadcrumbs.Root(
    {
      className,
      ...rootProps,
    } as BreadcrumbsRootProps<"nav">,
    [breadcrumbs.List(listProps, listChildren)],
  );
}, "Breadcrumbs");
