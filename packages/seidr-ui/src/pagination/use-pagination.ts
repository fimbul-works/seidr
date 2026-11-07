import { createRef, mergeValues, wrapValue } from "@fimbul-works/seidr";
import { useControllableValue } from "../hooks/use-controllable-value.js";
import type { UsePaginationOptions, UsePaginationResult } from "./types.js";
import { calculatePaginationTokens } from "./utils.js";

/**
 * Headless hook managing pagination state, active page clamping,
 * previous/next navigation, and token generation for pages and ellipses.
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const countVal = wrapValue(options.count ?? 1);
  const siblingCountVal = wrapValue(options.siblingCount ?? 1);
  const showFirstVal = wrapValue(options.showFirst ?? true);
  const showLastVal = wrapValue(options.showLast ?? true);
  const fixedItemsVal = wrapValue(options.fixedItems ?? false);
  const disabledVal = wrapValue(options.disabled ?? false);

  const internalPage = useControllableValue<number>({
    value: options.page,
    defaultValue: options.defaultPage ?? 1,
  });

  const rootRef = createRef<HTMLElement>();

  const setPage = (nextPage: number) => {
    if (disabledVal()) return;
    const total = Math.max(1, countVal());
    const clamped = Math.min(Math.max(1, nextPage), total);
    if (clamped !== internalPage()) {
      internalPage(clamped);
      options.onPageChange?.(clamped);
    }
  };

  const previous = () => {
    setPage(internalPage() - 1);
  };

  const next = () => {
    setPage(internalPage() + 1);
  };

  const isPreviousDisabled = mergeValues(() => disabledVal() || internalPage() <= 1, {
    parents: [disabledVal, internalPage],
  });

  const isNextDisabled = mergeValues(() => disabledVal() || internalPage() >= countVal(), {
    parents: [disabledVal, internalPage, countVal],
  });

  const tokens = mergeValues(
    () =>
      calculatePaginationTokens({
        count: countVal(),
        page: internalPage(),
        siblingCount: siblingCountVal(),
        showFirst: showFirstVal(),
        showLast: showLastVal(),
        fixedItems: fixedItemsVal(),
      }),
    {
      parents: [countVal, internalPage, siblingCountVal, showFirstVal, showLastVal, fixedItemsVal],
    },
  );

  return {
    page: internalPage.as((p) => p),
    count: countVal,
    setPage,
    previous,
    next,
    isPreviousDisabled,
    isNextDisabled,
    isDisabled: disabledVal,
    tokens,
    rootRef,
  };
}
