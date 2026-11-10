import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_ITEM_DESCRIPTION } from "../constants.js";
import type { MenuItemDescriptionProps } from "./types.js";

/**
 * Secondary description or subtitle for a menu item.
 */
export function MenuItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuItemDescriptionProps<T> = {} as MenuItemDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = DATA_COMPONENT_MENU, ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuItemDescription requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ITEM_DESCRIPTION,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
