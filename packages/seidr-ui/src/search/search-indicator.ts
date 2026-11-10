import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEARCH, DATA_PART_INDICATOR } from "../constants.js";
import type { SearchIndicatorProps } from "./types.js";

/**
 * Visual indicator element displayed inside the Search component.
 * Displays `loadingComponent` while async queries are in flight, otherwise displays default children.
 */
export function SearchIndicator<T extends keyof SeidrElementTagNameMap = "span">(
  props: SearchIndicatorProps<T> = {} as SearchIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance: search,
    dataComponent = DATA_COMPONENT_SEARCH,
    loadingComponent,
    ...rest
  } = props;

  if (!search) {
    throw new SeidrError("SearchIndicator requires an instance coordinator");
  }

  const indicatorChild =
    loadingComponent !== undefined
      ? Show(
          search.isLoadingSuggestions,
          () => loadingComponent,
          () => children ?? null,
        )
      : children;

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent,
      dataPart: DATA_PART_INDICATOR,
      dataLoading: search.isLoadingSuggestions.as((l) => (l ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    indicatorChild,
  );
}
