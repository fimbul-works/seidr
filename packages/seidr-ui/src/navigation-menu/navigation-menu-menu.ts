import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { NavigationMenuMenuProps } from "./types.js";

/**
 * Top-level menu item container in a NavigationMenu (renders a <li> container).
 */
export function NavigationMenuMenu<T extends keyof SeidrElementTagNameMap = "li">(
  props: NavigationMenuMenuProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "li" as T,
    value,
    instance,
    menuInstance,
    dataComponent = "navigation-menu",
    children: propsChildren,
    ...rest
  } = props;

  if (!value) {
    throw new SeidrError("NavigationMenuMenu requires a unique 'value' prop");
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
      role: "none",
      dataComponent,
      dataPart: "menu",
      dataValue: value,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

