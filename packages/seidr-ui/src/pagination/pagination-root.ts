import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PaginationRootProps } from "./types.js";

/**
 * PaginationRoot is the outer `<nav>` container for pagination controls.
 */
export function PaginationRoot<T extends keyof SeidrElementTagNameMap = "nav">(
  props: PaginationRootProps<T> = {} as PaginationRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "nav" as T,
    instance: pg,
    ariaLabel = "Pagination",
    dataComponent = "pagination",
    dataPart = "root",
    ...rest
  } = props;

  if (!pg) {
    throw new SeidrError("PaginationRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      "aria-label": ariaLabel,
      ref: pg.rootRef,
      "data-disabled": pg.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

