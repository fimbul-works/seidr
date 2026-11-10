import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_LISTBOX, DATA_PART_ITEM_DESCRIPTION } from "../constants.js";
import type { ListboxItemDescriptionProps } from "./types.js";

/**
 * An accessible secondary description element within a listbox item option.
 */
export function ListboxItemDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: ListboxItemDescriptionProps<T> = {} as ListboxItemDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, id: customId, dataComponent = DATA_COMPONENT_LISTBOX, ...rest } = props;

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
      dataPart: DATA_PART_ITEM_DESCRIPTION,
      dataSelected: item.isSelected.as((s) => (s ? "" : undefined)),
      dataHighlighted: item.isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: item.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
