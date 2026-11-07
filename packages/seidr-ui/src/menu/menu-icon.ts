import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuIconProps } from "./types.js";

/**
 * Visual decorative icon element within a menu trigger or item.
 */
export function MenuIcon<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuIconProps<T> = {} as MenuIconProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuIcon requires an instance coordinator");
  }

  return $(
    as,
    {
      "aria-hidden": "true",
      dataComponent,
      dataPart: "icon",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

