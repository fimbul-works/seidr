import { createComponent, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createPagination } from "./create-pagination.js";
import type { PaginationProps, PaginationRootProps } from "./types.js";

/**
 * Unified all-in-one Pagination component (Tier 1).
 * Composes an accessible navigation landmark with a list of page buttons,
 * automatic ellipsis collapsing, and previous/next navigation triggers.
 */
export const Pagination = createComponent(
  <T extends keyof SeidrElementTagNameMap = "nav">(props: PaginationProps<T> = {}): SeidrElementTagNameMap[T] => {
    const {
      as = "nav" as T,
      ariaLabel = "Pagination",
      showControls = true,
      previousLabel,
      nextLabel,
      rootProps = {},
      listProps = {},
      itemProps = {},
      ellipsisProps = {},
      previousProps = {},
      nextProps = {},
      children,
      ...paginationOptions
    } = props;

    const pg = createPagination(paginationOptions);

    if (children !== undefined) {
      return pg.Root({ as, ariaLabel, ...rootProps } as PaginationRootProps<T>, children);
    }

    const prevEl = showControls ? pg.Previous(previousProps, previousLabel) : null;
    const itemsEl = pg.Items({ itemProps, ellipsisProps });
    const nextEl = showControls ? pg.Next(nextProps, nextLabel) : null;

    return pg.Root(
      { as, ariaLabel, ...rootProps } as PaginationRootProps<T>,
      pg.List(listProps, [prevEl, itemsEl, nextEl]),
    );
  },
  "Pagination",
);
