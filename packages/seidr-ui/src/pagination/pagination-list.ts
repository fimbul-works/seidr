import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PaginationListProps } from "./types.js";

/**
 * PaginationList is the `<ul>` container for pagination items.
 */
export function PaginationList<T extends keyof SeidrElementTagNameMap = "ul">(
  props: PaginationListProps<T> = {} as PaginationListProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "ul" as T, instance: pg, dataComponent = "pagination", dataPart = "list", ...rest } = props;

  if (!pg) {
    throw new SeidrError("PaginationList requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
