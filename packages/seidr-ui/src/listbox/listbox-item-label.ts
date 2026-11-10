import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_LISTBOX, DATA_PART_ITEM_LABEL } from "../constants.js";
import type { ListboxItemLabelProps } from "./types.js";

/**
 * An accessible label element within a listbox item option.
 */
export function ListboxItemLabel<T extends keyof SeidrElementTagNameMap = "div">(
  props: ListboxItemLabelProps<T> = {} as ListboxItemLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, id: customId, dataComponent = DATA_COMPONENT_LISTBOX, ...rest } = props;

  if (!item) {
    throw new SeidrError("ListboxItemLabel requires an item instance");
  }

  const id = typeof customId === "string" ? customId : `${item.id}-label`;
  onUnmounted(item.registerLabelId(id));

  return $(
    as,
    {
      id,
      dataComponent,
      dataPart: DATA_PART_ITEM_LABEL,
      dataSelected: item.isSelected.as((s) => (s ? "" : undefined)),
      dataHighlighted: item.isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: item.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
