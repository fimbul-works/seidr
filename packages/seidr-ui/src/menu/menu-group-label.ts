import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuGroupLabelProps } from "./types.js";

/**
 * Accessible header or label for a menu group.
 */
export function MenuGroupLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuGroupLabelProps<T> = {} as MenuGroupLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuGroupLabel requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "group-label",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

