import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_ITEM_LABEL } from "../constants.js";
import type { MenuItemLabelProps } from "./types.js";

/**
 * Text label for a menu item.
 */
export function MenuItemLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuItemLabelProps<T> = {} as MenuItemLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = DATA_COMPONENT_MENU, ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuItemLabel requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ITEM_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
