import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ListboxItemDescriptionProps } from "./types.js";

/**
 * An accessible secondary description element within a listbox item option.
 */
export function ListboxItemDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: ListboxItemDescriptionProps<T> = {} as ListboxItemDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, id: customId, dataComponent = "listbox", ...rest } = props;

  if (!item) {
    throw new SeidrError("ListboxItemDescription requires an item instance");
  }

  const id = typeof customId === "string" ? customId : `${item.id}-description`;
  onUnmounted(item.registerDescriptionId(id));

  return $(
    as,
    {
      id,
      dataComponent,
      dataPart: "item-description",
      dataSelected: item.isSelected.as((s) => (s ? "" : undefined)),
      dataHighlighted: item.isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: item.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
