import type { SeidrChild } from "@fimbul-works/seidr";
import { PaginationEllipsis } from "./pagination-ellipsis.js";
import { PaginationItem } from "./pagination-item.js";
import { PaginationItems } from "./pagination-items.js";
import { PaginationList } from "./pagination-list.js";
import { PaginationNext } from "./pagination-next.js";
import { PaginationPrevious } from "./pagination-previous.js";
import { PaginationRoot } from "./pagination-root.js";
import type {
  PaginationEllipsisProps,
  PaginationInstance,
  PaginationItemProps,
  PaginationItemsProps,
  PaginationListProps,
  PaginationNextProps,
  PaginationPreviousProps,
  PaginationRootProps,
  UsePaginationOptions,
} from "./types.js";
import { usePagination } from "./use-pagination.js";

/**
 * Creates a Pagination state coordinator instance with pre-bound compound element helpers.
 */
export function createPagination(options: UsePaginationOptions = {}): PaginationInstance {
  const instance = usePagination(options);

  return {
    ...instance,
    Root: (props: PaginationRootProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      PaginationRoot({ instance, ...props }, children),
    List: (props: PaginationListProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      PaginationList({ instance, ...props }, children),
    Item: (props: PaginationItemProps<any>, children?: SeidrChild | SeidrChild[]) =>
      PaginationItem({ instance, ...props }, children),
    Ellipsis: (props: PaginationEllipsisProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      PaginationEllipsis({ instance, ...props }, children),
    Previous: (props: PaginationPreviousProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      PaginationPrevious({ instance, ...props }, children),
    Next: (props: PaginationNextProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      PaginationNext({ instance, ...props }, children),
    Items: (props: PaginationItemsProps = {}) => PaginationItems({ instance, ...props }),
  };
}
