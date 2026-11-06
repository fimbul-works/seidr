import { useRadioGroupItem } from "../radio-group/use-radio-group-item.js";
import type {
  UseSegmentedControlItemOptions,
  UseSegmentedControlItemResult,
  UseSegmentedControlResult,
} from "./types.js";

/**
 * Headless hook managing state, accessibility attributes, and identifiers
 * for an individual SegmentedControl option item.
 */
export function useSegmentedControlItem(
  segmentedControl: UseSegmentedControlResult,
  options: UseSegmentedControlItemOptions,
): UseSegmentedControlItemResult {
  const item = useRadioGroupItem(segmentedControl, options);

  return {
    ...item,
    group: segmentedControl,
    segmentedControl,
  };
}
