import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_COMPONENT_LISTBOX, DATA_PART_SECTION_LABEL } from "../constants.js";
import type { ListboxSectionLabelProps } from "./types.js";

/**
 * Accessible header or label element for an option grouping section.
 */
export function ListboxSectionLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: ListboxSectionLabelProps<T> = {} as ListboxSectionLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, role = "presentation", dataComponent = DATA_COMPONENT_LISTBOX, ...rest } = props;

  return $(
    as,
    {
      role,
      dataComponent,
      dataPart: DATA_PART_SECTION_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
