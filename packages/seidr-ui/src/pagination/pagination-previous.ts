import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_PAGINATTION, DATA_PART_PREVIOUS, DATA_PART_PREVIOUS_WRAPPER } from "../constants.js";
import type { PaginationPreviousProps } from "./types.js";

/**
 * PaginationPrevious is a button that steps to the previous page, wrapped in an `<li>`.
 */
export function PaginationPrevious<T extends keyof SeidrElementTagNameMap = "button">(
  props: PaginationPreviousProps<T> = {} as PaginationPreviousProps<T>,
  children?: SeidrChild | SeidrChild[],
): HTMLLIElement {
  const {
    as = "button" as T,
    instance: pg,
    dataComponent = DATA_COMPONENT_PAGINATTION,
    dataPart = DATA_PART_PREVIOUS,
    onclick,
    ...rest
  } = props;

  if (!pg) {
    throw new SeidrError("PaginationPrevious requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as (ev: MouseEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    pg.previous();
  };

  const button = $(
    as,
    {
      type: as === "button" ? "button" : undefined,
      tabIndex: pg.isPreviousDisabled.as((d) => (d ? -1 : undefined)),
      disabled: pg.isPreviousDisabled,
      "aria-disabled": pg.isPreviousDisabled.as((d) => (d ? "true" : undefined)),
      "aria-label": "Previous Page",
      "data-disabled": pg.isPreviousDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? "Previous",
  );

  return $(
    "li",
    {
      dataComponent,
      dataPart: DATA_PART_PREVIOUS_WRAPPER,
    },
    button,
  );
}
