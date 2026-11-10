import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL, DATA_PART_ROOT } from "../constants.js";
import type { UseSegmentedControlOptions, UseSegmentedControlResult } from "./types.js";

export interface SegmentedControlRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends UseSegmentedControlOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit segmented control instance providing reactive state.
   */
  instance?: UseSegmentedControlResult;
}

export type SegmentedControlRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SegmentedControlRootOptions<T> &
  SeidrElementProps<T>;

/**
 * SegmentedControlRoot is the outer container for a segmented control (role="radiogroup").
 */
export function SegmentedControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: SegmentedControlRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: sc,
    id,
    name,
    value,
    defaultValue,
    onChange,
    orientation,
    validationState,
    required,
    disabled,
    readOnly,
    ...rest
  } = props;

  if (!sc) {
    throw new SeidrError("SegmentedControlRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: id ?? sc.id,
      ...sc.ariaProps,
      ...sc.dataset,
      ref: sc.rootRef,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
