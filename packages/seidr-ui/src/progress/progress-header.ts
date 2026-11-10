import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_COMPONENT_PROGRESS, DATA_PART_HEADER } from "../constants.js";
import type { ProgressHeaderProps } from "./types.js";

/**
 * Semantic header container element for grouping Progress/Meter Label and ValueLabel.
 */
export function ProgressHeader<T extends keyof SeidrElementTagNameMap = "div">(
  props: ProgressHeaderProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = instance?.dataComponent ?? DATA_COMPONENT_PROGRESS,
    ...rest
  } = props;

  return $(
    as as T,
    {
      dataComponent,
      dataPart: DATA_PART_HEADER,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
