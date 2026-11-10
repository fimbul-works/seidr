import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_PAGINATTION, DATA_PART_ELLIPSIS, DATA_PART_ELLIPSIS_WRAPPER } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_PAGINATTION,
    dataPart = DATA_PART_ELLIPSIS,
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
      dataPart: DATA_PART_ELLIPSIS_WRAPPER,
    },
    content,
  );
}
