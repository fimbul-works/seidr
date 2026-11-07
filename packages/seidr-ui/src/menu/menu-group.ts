import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuGroupProps } from "./types.js";

/**
 * Structural container for grouping related menu items (role="group").
 */
export function MenuGroup<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuGroupProps<T> = {} as MenuGroupProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuGroup requires an instance coordinator");
  }

  return $(
    as,
    {
      role: "group",
      dataComponent,
      dataPart: "group",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

