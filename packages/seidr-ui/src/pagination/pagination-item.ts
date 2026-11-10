import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_PAGINATTION, DATA_PART_ITEM, DATA_PART_ITEM_WRAPPER } from "../constants.js";
import type { PaginationItemProps } from "./types.js";

/**
 * PaginationItem represents a single page button wrapped inside an `<li>`.
 */
export function PaginationItem<T extends keyof SeidrElementTagNameMap = "button">(
  props: PaginationItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): HTMLLIElement {
  const {
    as = "button" as T,
    instance: pg,
    page,
    key: _key,
    dataComponent = DATA_COMPONENT_PAGINATTION,
    dataPart = DATA_PART_ITEM,
    onclick,
    ...rest
  } = props;

  if (!pg) {
    throw new SeidrError("PaginationItem requires an instance coordinator");
  }

  const isCurrent = pg.page.as((p) => p === page);

  const handleClick = (e: MouseEvent) => {
    (onclick as (ev: MouseEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    pg.setPage(page);
  };

  const button = $(
    as,
    {
      type: as === "button" ? "button" : undefined,
      "aria-current": isCurrent.as((cur) => (cur ? "page" : undefined)),
      "aria-label": `Page ${page}`,
      "data-current": isCurrent.as((cur) => (cur ? "" : undefined)),
      disabled: pg.isDisabled,
      "data-disabled": pg.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? String(page),
  );

  return $(
    "li",
    {
      dataComponent,
      dataPart: DATA_PART_ITEM_WRAPPER,
    },
    button,
  );
}
