import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import type { ListboxSectionLabelProps } from "./types.js";

/**
 * Accessible header or label element for an option grouping section.
 */
export function ListboxSectionLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: ListboxSectionLabelProps<T> = {} as ListboxSectionLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, role = "presentation", dataComponent = "listbox", ...rest } = props;

  return $(
    as,
    {
      role,
      dataComponent,
      dataPart: "section-label",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
