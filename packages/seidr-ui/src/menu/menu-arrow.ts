import {
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { MenuArrowProps } from "./types.js";

/**
 * Floating arrow pointer attached to the PopperPositioner of a MenuContent.
 */
export function MenuArrow<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuArrowProps<T> = {} as MenuArrowProps<T>,
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: menu, dataComponent = "menu", size, ...rest } = props;

  if (!menu) {
    throw new SeidrError("MenuArrow requires an instance coordinator");
  }

  return PopperArrow<T>({
    as,
    instance: menu.popper,
    dataComponent,
    size,
    ...rest,
  });
}

