import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuRadioGroupProps } from "./types.js";
import { useMenuRadioGroup } from "./use-menu.js";

/**
 * Radio group container within a Menu (role="group").
 */
export function MenuRadioGroup<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuRadioGroupProps<T> = {} as MenuRadioGroupProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: menu,
    dataComponent = "menu",
    radioGroupInstance,
    value,
    defaultValue,
    onChange,
    disabled,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuRadioGroup requires an instance coordinator");
  }

  // Create radio group instance if not explicitly provided
  const group =
    radioGroupInstance ??
    useMenuRadioGroup({
      value,
      defaultValue,
      onChange,
      disabled,
    });

  return $(
    as,
    {
      role: "group",
      dataComponent,
      dataPart: "radio-group",
      "data-disabled": group.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

