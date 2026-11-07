import type { PaginationToken } from "./types.js";

export interface CalculatePaginationOptions {
  count: number;
  page: number;
  siblingCount?: number;
  showFirst?: boolean;
  showLast?: boolean;
  fixedItems?: boolean | "no-ellipsis";
}

/**
 * Calculates the array of page items and ellipses to display.
 */
export function calculatePaginationTokens(options: CalculatePaginationOptions): PaginationToken[] {
  const count = Math.max(1, options.count);
  const page = Math.min(Math.max(1, options.page), count);
  const siblingCount = options.siblingCount ?? 1;
  const showFirst = options.showFirst ?? true;
  const showLast = options.showLast ?? true;
  const fixedItems = options.fixedItems ?? false;

  // Render directly if count is small enough that ellipses are not needed
  const renderItemsDirectly = count < 2 * siblingCount + (fixedItems !== false ? 6 : 4);

  if (renderItemsDirectly) {
    const tokens: PaginationToken[] = [];
    for (let p = 1; p <= count; p++) {
      tokens.push({
        type: "page",
        page: p,
        isCurrent: p === page,
        key: `page-${p}`,
      });
    }
    return tokens;
  }

  const _showFirst = showFirst && page - 1 > siblingCount;
  const _showLast = showLast && count - page > siblingCount;

  let showFirstEllipsis = fixedItems !== "no-ellipsis" && page - (showFirst ? 2 : 1) > siblingCount;
  let showLastEllipsis = fixedItems !== "no-ellipsis" && count - page - (showLast ? 1 : 0) > siblingCount;

  let previousSiblingCount = Math.min(page - 1, siblingCount);
  let nextSiblingCount = Math.min(count - page, siblingCount);

  if (fixedItems !== false) {
    const previousSiblingCountRef = previousSiblingCount;
    const nextSiblingCountRef = nextSiblingCount;

    previousSiblingCount += Math.max(siblingCount - nextSiblingCountRef, 0);
    nextSiblingCount += Math.max(siblingCount - previousSiblingCountRef, 0);

    if (showFirst && !_showFirst) nextSiblingCount++;
    if (showLast && !_showLast) previousSiblingCount++;

    if (fixedItems === true) {
      if (!showFirstEllipsis) nextSiblingCount++;
      if (!showLastEllipsis) previousSiblingCount++;

      // Replace ellipsis if it would replace only one item
      if (page - previousSiblingCount - (showFirst ? 2 : 1) === 1) {
        showFirstEllipsis = false;
        previousSiblingCount++;
      }

      if (count - page - nextSiblingCount - (showLast ? 1 : 0) === 1) {
        showLastEllipsis = false;
        nextSiblingCount++;
      }
    }
  }

  const tokens: PaginationToken[] = [];

  // First page
  if (_showFirst) {
    tokens.push({
      type: "page",
      page: 1,
      isCurrent: page === 1,
      key: "page-1",
    });
  }

  // First ellipsis
  if (showFirstEllipsis) {
    tokens.push({
      type: "ellipsis",
      key: "ellipsis-first",
    });
  }

  // Previous siblings
  for (let offset = previousSiblingCount; offset >= 1; offset--) {
    const p = page - offset;
    tokens.push({
      type: "page",
      page: p,
      isCurrent: false,
      key: `page-${p}`,
    });
  }

  // Current page
  tokens.push({
    type: "page",
    page,
    isCurrent: true,
    key: `page-${page}`,
  });

  // Next siblings
  for (let offset = 1; offset <= nextSiblingCount; offset++) {
    const p = page + offset;
    tokens.push({
      type: "page",
      page: p,
      isCurrent: false,
      key: `page-${p}`,
    });
  }

  // Last ellipsis
  if (showLastEllipsis) {
    tokens.push({
      type: "ellipsis",
      key: "ellipsis-last",
    });
  }

  // Last page
  if (_showLast) {
    tokens.push({
      type: "page",
      page: count,
      isCurrent: page === count,
      key: `page-${count}`,
    });
  }

  return tokens;
}

