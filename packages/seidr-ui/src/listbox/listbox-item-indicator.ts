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
import type { ListboxItemIndicatorProps } from "./types.js";

/**
 * Visual indicator element rendered when an item option is selected.
 */
export function ListboxItemIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: ListboxItemIndicatorProps<T> = {} as ListboxItemIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: item, forceMount = false, dataComponent = "listbox", ...rest } = props;

  if (!item) {
    throw new SeidrError("ListboxItemIndicator requires an item instance");
  }

  const isVisible = forceMount ? wrapValue(true) : item.isSelected;

  return Show(
    isVisible,
    () =>
      $(
        as,
        {
          dataComponent,
          dataPart: "item-indicator",
          ariaHidden: "true",
          dataSelected: item.isSelected.as((s) => (s ? "" : undefined)),
          dataHighlighted: item.isHighlighted.as((h) => (h ? "" : undefined)),
          dataDisabled: item.isDisabled.as((d) => (d ? "" : undefined)),
          ...rest,
        } as SeidrElementProps<T>,
        children ?? "✓",
      ) as SeidrElementTagNameMap[T],
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

