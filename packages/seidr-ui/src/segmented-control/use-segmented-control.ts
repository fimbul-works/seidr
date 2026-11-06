import { createValue, type Value } from "@fimbul-works/seidr";
import { useRadioGroup } from "../radio-group/use-radio-group.js";
import type { UseSegmentedControlOptions, UseSegmentedControlResult } from "./types.js";

/**
 * Headless hook providing reactive state, WAI-ARIA coordination, and form control
 * bindings for an accessible SegmentedControl component.
 */
export function useSegmentedControl(options: UseSegmentedControlOptions = {}): UseSegmentedControlResult {
  const orientation = options.orientation ?? "horizontal";

  const radioGroup = useRadioGroup({
    ...options,
    orientation,
  });

  const selectedItemElement: Value<HTMLElement | null> = createValue<HTMLElement | null>(null);
  const items = new Map<string, HTMLElement>();

  const registerItem = (val: string, el: HTMLElement) => {
    items.set(val, el);

    if (radioGroup.isSelectedValue(val)) {
      selectedItemElement(el);
    }

    return () => {
      items.delete(val);
      if (selectedItemElement() === el) {
        selectedItemElement(null);
      }
    };
  };

  // Keep selected element synchronized when reactive value updates
  radioGroup.value.watch((currentVal) => {
    const el = items.get(currentVal) ?? null;
    selectedItemElement(el);
  });

  const setSelectedValue = (newValue: string) => {
    radioGroup.setSelectedValue(newValue);
    const el = items.get(newValue) ?? null;
    selectedItemElement(el);
  };

  return {
    ...radioGroup,
    orientation,
    setSelectedValue,
    selectedItemElement,
    registerItem,
  };
}

