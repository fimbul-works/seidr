import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuSubProps } from "./types.js";

/**
 * Container element for a nested submenu.
 */
export function MenuSub<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuSubProps<T> = {} as MenuSubProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: menu, subInstance, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuSub requires a parent menu coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "sub",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

