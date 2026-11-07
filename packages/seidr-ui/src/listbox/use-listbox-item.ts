import { createValue, type DerivedValue, mergeValues, type Value, wrapValue } from "@fimbul-works/seidr";
import type { UseListboxItemOptions, UseListboxItemResult, UseListboxResult } from "./types.js";

/**
 * Headless hook managing state, accessibility attributes, and identifiers
 * for an individual Listbox option item.
 */
export function useListboxItem(listbox: UseListboxResult, options: UseListboxItemOptions): UseListboxItemResult {
  const value = options.value;
  const id = options.id ?? `${listbox.id}-item-${value}`;
  const labelId: Value<string | undefined> = createValue<string | undefined>(undefined);
  const descriptionId: Value<string | undefined> = createValue<string | undefined>(undefined);

  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = mergeValues(() => listbox.isDisabled() || Boolean(disabledObservable()), {
    parents: [listbox.isDisabled, disabledObservable],
  });

  const isSelected = listbox.isSelected(value);
  const isHighlighted = listbox.isHighlighted(value);
  const tabIndex = listbox.getItemTabIndex(value, () => isDisabled());

  const registerLabelId = (newId: string) => {
    labelId(newId);
    return () => {
      if (labelId() === newId) {
        labelId(undefined);
      }
    };
  };

  const registerDescriptionId = (newId: string) => {
    descriptionId(newId);
    return () => {
      if (descriptionId() === newId) {
        descriptionId(undefined);
      }
    };
  };

  return {
    id,
    value,
    isSelected,
    isHighlighted,
    isDisabled,
    tabIndex,
    labelId,
    descriptionId,
    registerLabelId,
    registerDescriptionId,
    listbox,
  };
}
