import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_RADIO_GROUP } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_MENU,
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
      dataPart: DATA_PART_RADIO_GROUP,
      "data-disabled": group.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
