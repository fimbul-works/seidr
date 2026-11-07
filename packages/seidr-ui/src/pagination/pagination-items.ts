import { type DerivedValue, type SeidrChild, SeidrError } from "@fimbul-works/seidr";
import { PaginationEllipsis } from "./pagination-ellipsis.js";
import { PaginationItem } from "./pagination-item.js";
import type { PaginationItemsProps } from "./types.js";

/**
 * PaginationItems maps the calculated page and ellipsis tokens into DOM elements reactively.
 */
export function PaginationItems(props: PaginationItemsProps = {}): DerivedValue<SeidrChild[]> {
  const { instance: pg, itemProps = {}, ellipsisProps = {} } = props;

  if (!pg) {
    throw new SeidrError("PaginationItems requires an instance coordinator");
  }

  return pg.tokens.as((tokenList) =>
    tokenList.map((token) => {
      if (token.type === "page") {
        return PaginationItem({
          instance: pg,
          page: token.page,
          key: token.key,
          ...itemProps,
        });
      }
      return PaginationEllipsis({
        instance: pg,
        key: token.key,
        ...ellipsisProps,
      });
    }),
  );
}

