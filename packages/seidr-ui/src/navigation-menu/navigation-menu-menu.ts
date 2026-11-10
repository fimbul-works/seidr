import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NAVIGATION_MENU, DATA_PART_MENU } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_NAVIGATION_MENU,
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
      dataPart: DATA_PART_MENU,
      dataValue: value,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
