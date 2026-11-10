import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENUBAR, DATA_PART_MENU } from "../constants.js";
import type { MenubarMenuProps } from "./types.js";

/**
 * Top-level menu container grouping a Menubar Trigger and Content dropdown.
 */
export function MenubarMenu<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenubarMenuProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    value,
    instance: menubar,
    menuInstance,
    dataComponent = DATA_COMPONENT_MENUBAR,
    children: propsChildren,
    ...rest
  } = props;

  if (!value) {
    throw new SeidrError("MenubarMenu requires a unique 'value' prop");
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
      dataComponent,
      dataPart: DATA_PART_MENU,
      dataValue: value,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
