import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_ROOT } from "../constants.js";
import type { MenuRootProps } from "./types.js";

/**
 * Top-level container for a Menu.
 */
export function MenuRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuRootProps<T> = {} as MenuRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: menu, dataComponent = DATA_COMPONENT_MENU, ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
