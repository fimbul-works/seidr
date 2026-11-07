import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuItemLabelProps } from "./types.js";

/**
 * Text label for a menu item.
 */
export function MenuItemLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuItemLabelProps<T> = {} as MenuItemLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuItemLabel requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "item-label",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

