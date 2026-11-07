import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuSeparatorProps } from "./types.js";

/**
 * Visual separator divider between menu items (role="separator").
 */
export function MenuSeparator<T extends keyof SeidrElementTagNameMap = "hr">(
  props: MenuSeparatorProps<T> = {} as MenuSeparatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "hr" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuSeparator requires an instance coordinator");
  }

  return $(
    as,
    {
      role: "separator",
      "aria-orientation": "horizontal",
      dataComponent,
      dataPart: "separator",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

