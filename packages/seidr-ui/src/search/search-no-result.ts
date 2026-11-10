import {
  $,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import { DATA_PART_NO_RESULT } from "../constants.js";
import type { SearchNoResultProps } from "./types.js";

/**
 * Message or fallback container displayed when search options are empty.
 */
export function SearchNoResult<T extends keyof SeidrElementTagNameMap = "div">(
  props: SearchNoResultProps<T> = {} as SearchNoResultProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: search, dataComponent = "search", ...rest } = props;

  if (!search) {
    throw new SeidrError("SearchNoResult requires an instance coordinator");
  }

  const renderEl = () =>
    $(
      as,
      {
        dataComponent,
        dataPart: DATA_PART_NO_RESULT,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

  return Show(search.noResult, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
