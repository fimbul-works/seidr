import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuItemDescriptionProps } from "./types.js";

/**
 * Secondary description or subtitle for a menu item.
 */
export function MenuItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuItemDescriptionProps<T> = {} as MenuItemDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuItemDescription requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "item-description",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

