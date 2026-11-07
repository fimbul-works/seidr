import {
  $,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import type { MenuItemIndicatorProps } from "./types.js";

/**
 * Visual indicator element (checkmark, dot, bullet) displayed when a checkbox
 * or radio menu item is checked.
 */
export function MenuItemIndicator<T extends keyof SeidrElementTagNameMap = "span">(
  props: MenuItemIndicatorProps<T> = {} as MenuItemIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "span" as T,
    instance: menu,
    checked,
    forceMount = false,
    dataComponent = "menu",
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuItemIndicator requires an instance coordinator");
  }

  const renderIndicator = (): SeidrElementTagNameMap[T] =>
    $(
      as,
      {
        "aria-hidden": "true",
        dataComponent,
        dataPart: "item-indicator",
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

  if (forceMount) {
    return wrapValue(renderIndicator()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  if (checked) {
    return Show(
      checked.as((c) => Boolean(c)),
      () => renderIndicator(),
    ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return wrapValue(renderIndicator()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

