import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuRootProps } from "./types.js";

/**
 * Top-level container for a Menu.
 */
export function MenuRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuRootProps<T> = {} as MenuRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: menu, dataComponent = "menu", ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

