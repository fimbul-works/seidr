import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_COMPONENT_LISTBOX, DATA_PART_SECTION } from "../constants.js";
import type { ListboxSectionProps } from "./types.js";

/**
 * Grouping section element within a listbox.
 */
export function ListboxSection<T extends keyof SeidrElementTagNameMap = "li">(
  props: ListboxSectionProps<T> = {} as ListboxSectionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "li" as T, role = "presentation", dataComponent = DATA_COMPONENT_LISTBOX, ...rest } = props;

  return $(
    as,
    {
      role,
      dataComponent,
      dataPart: DATA_PART_SECTION,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
