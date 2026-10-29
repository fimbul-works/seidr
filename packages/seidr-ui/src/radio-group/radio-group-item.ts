import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseRadioGroupItemOptions, UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends Partial<UseRadioGroupItemOptions> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;
}

export type RadioGroupItemProps<T extends keyof SeidrElementTagNameMap = "div"> = RadioGroupItemOptions<T> &
  SeidrElementProps<T>;

/**
 * RadioGroupItem is the container for a single radio option (role="group").
 */
export function RadioGroupItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: RadioGroupItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, onpointerdown, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItem requires an instance coordinator");
  }

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as any)?.(e);
    if (e.defaultPrevented) return;

    // For consistency with native controls, prevent blur on pointerdown when already focused
    if (item.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as as T,
    {
      role: "group",
      id: item.id,
      ...item.dataset,
      onpointerdown: handlePointerDown,
      dataComponent: "radio-group",
      dataPart: "item",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
