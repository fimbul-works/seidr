import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_PAGINATTION, DATA_PART_NEXT, DATA_PART_NEXT_WRAPPER } from "../constants.js";
import type { PaginationNextProps } from "./types.js";

/**
 * PaginationNext is a button that steps to the next page, wrapped in an `<li>`.
 */
export function PaginationNext<T extends keyof SeidrElementTagNameMap = "button">(
  props: PaginationNextProps<T> = {} as PaginationNextProps<T>,
  children?: SeidrChild | SeidrChild[],
): HTMLLIElement {
  const {
    as = "button" as T,
    instance: pg,
    dataComponent = DATA_COMPONENT_PAGINATTION,
    dataPart = DATA_PART_NEXT,
    onclick,
    ...rest
  } = props;

  if (!pg) {
    throw new SeidrError("PaginationNext requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as (ev: MouseEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    pg.next();
  };

  const button = $(
    as,
    {
      type: as === "button" ? "button" : undefined,
      tabIndex: pg.isNextDisabled.as((d) => (d ? -1 : undefined)),
      disabled: pg.isNextDisabled,
      "aria-disabled": pg.isNextDisabled.as((d) => (d ? "true" : undefined)),
      "aria-label": "Next Page",
      "data-disabled": pg.isNextDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? "Next",
  );

  return $(
    "li",
    {
      dataComponent,
      dataPart: DATA_PART_NEXT_WRAPPER,
    },
    button,
  );
}
