import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import type { ListboxSectionProps } from "./types.js";

/**
 * Grouping section element within a listbox.
 */
export function ListboxSection<T extends keyof SeidrElementTagNameMap = "li">(
  props: ListboxSectionProps<T> = {} as ListboxSectionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "li" as T, role = "presentation", dataComponent = "listbox", ...rest } = props;

  return $(
    as,
    {
      role,
      dataComponent,
      dataPart: "section",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
