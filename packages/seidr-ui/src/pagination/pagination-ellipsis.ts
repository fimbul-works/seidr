import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PaginationEllipsisProps } from "./types.js";

/**
 * PaginationEllipsis renders an ellipsis indicating skipped pages, wrapped in an `<li>`.
 */
export function PaginationEllipsis<T extends keyof SeidrElementTagNameMap = "span">(
  props: PaginationEllipsisProps<T> = {} as PaginationEllipsisProps<T>,
  children?: SeidrChild | SeidrChild[],
): HTMLLIElement {
  const {
    as = "span" as T,
    instance: pg,
    key: _key,
    dataComponent = "pagination",
    dataPart = "ellipsis",
    ...rest
  } = props;

  if (!pg) {
    throw new SeidrError("PaginationEllipsis requires an instance coordinator");
  }

  const content = $(
    as,
    {
      "aria-hidden": "true",
      dataComponent,
      dataPart,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? "…",
  );

  return $(
    "li",
    {
      dataComponent,
      dataPart: "ellipsis-wrapper",
    },
    content,
  );
}
