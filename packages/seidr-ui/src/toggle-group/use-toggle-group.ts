import {
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  mergeValues,
  unwrapValue,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import type { UseToggleGroupOptions, UseToggleGroupResult } from "./types.js";

interface ItemEntry {
  value: string;
  el: HTMLElement;
  isItemDisabled: () => boolean;
}

/**
 * Headless reactive coordinator for an accessible WAI-ARIA ToggleGroup (role="group").
 */
export function useToggleGroup(options: UseToggleGroupOptions = {}): UseToggleGroupResult {
  const {
    id: customId,
    orientation = "horizontal",
    multiple = false,
    disallowEmptySelection = false,
    loop = true,
  } = options;

  const id = customId ?? useId("toggle-group");
  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = disabledObservable.as(Boolean);

  // Normalize initial selection into string[]
  const computeInitialSelected = (): string[] => {
    const rawVal = unwrapValue(options.value);
    if (rawVal !== undefined) {
      if (Array.isArray(rawVal)) {
        return rawVal;
      }
      return rawVal ? [rawVal] : [];
    }
    const def = options.defaultValue;
    if (def !== undefined) {
      if (Array.isArray(def)) {
        return def;
      }
      return def ? [def] : [];
    }
    return [];
  };

  const initialSelected = computeInitialSelected();
  const internalState: Value<string[]> = createValue<string[]>(initialSelected);

  // Sync if controlled value changes externally
  if (isValue(options.value)) {
    options.value.watch((nextVal) => {
      if (Array.isArray(nextVal)) {
        internalState(nextVal);
      } else if (nextVal) {
        internalState([nextVal]);
      } else {
        internalState([]);
      }
    });
  }

  const focusedKey: Value<string | null> = createValue<string | null>(initialSelected[0] ?? null);

  const items: ItemEntry[] = [];

  const isSelected = (value: string): DerivedValue<boolean> => {
    return internalState.as((vals) => vals.includes(value));
  };

  const getItemTabIndex = (value: string, isItemDisabled: () => boolean): DerivedValue<number | undefined> => {
    return mergeValues(
      () => {
        if (isDisabled() || isItemDisabled()) {
          return -1;
        }

        const currentFocused = focusedKey();
        if (currentFocused !== null) {
          return currentFocused === value ? 0 : -1;
        }

        // Fallback: if no focused item, pick first enabled selected item or first enabled item
        const selected = internalState();
        if (selected.length > 0) {
          const firstSelected = selected[0];
          return firstSelected === value ? 0 : -1;
        }

        const firstEnabled = items.find((item) => !item.isItemDisabled());
        if (firstEnabled) {
          return firstEnabled.value === value ? 0 : -1;
        }

        return 0;
      },
      { parents: [isDisabled, internalState, focusedKey] },
    );
  };

  const toggle = (value: string) => {
    if (isDisabled()) return;

    const entry = items.find((item) => item.value === value);
    if (entry?.isItemDisabled()) return;

    const current = internalState();

    if (multiple) {
      let nextList: string[];
      if (current.includes(value)) {
        if (disallowEmptySelection && current.length <= 1) return;
        nextList = current.filter((k) => k !== value);
      } else {
        nextList = [...current, value];
      }
      internalState(nextList);
      focusedKey(value);
      (options.onChange as ((val: string[]) => void) | undefined)?.(nextList);
    } else {
      let nextVal: string | null = null;
      let nextList: string[] = [];
      if (current.includes(value)) {
        if (disallowEmptySelection) return;
        nextVal = null;
        nextList = [];
      } else {
        nextVal = value;
        nextList = [value];
      }
      internalState(nextList);
      focusedKey(value);
      (options.onChange as ((val: string | null) => void) | undefined)?.(nextVal);
    }
  };

  const registerItem = (value: string, el: HTMLElement, isItemDisabled: () => boolean): (() => void) => {
    const entry: ItemEntry = { value, el, isItemDisabled };
    items.push(entry);

    // If no focused key was set, set to first registered enabled item
    if (focusedKey() === null && !isItemDisabled()) {
      focusedKey(value);
    }

    return () => {
      const idx = items.indexOf(entry);
      if (idx !== -1) {
        items.splice(idx, 1);
      }
      if (focusedKey() === value) {
        const nextEnabled = items.find((item) => !item.isItemDisabled());
        focusedKey(nextEnabled ? nextEnabled.value : null);
      }
    };
  };

  const handleItemKeyDown = (e: KeyboardEvent, currentKey: string) => {
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    if (
      e.key !== nextKey &&
      e.key !== prevKey &&
      e.key !== "Home" &&
      e.key !== "End" &&
      e.key !== "Enter" &&
      e.key !== " "
    ) {
      return;
    }

    inClient(() => {
      // Space or Enter toggles the focused item
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(currentKey);
        return;
      }

      // Filter and sort items according to document order
      const validItems = items
        .filter((item) => item.el.isConnected && !item.isItemDisabled() && !isDisabled())
        .sort((a, b) => {
          if (a.el === b.el) return 0;
          return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
        });

      if (validItems.length === 0) return;

      const currentIndex = validItems.findIndex((item) => item.value === currentKey);
      let targetIndex = currentIndex;

      if (e.key === nextKey) {
        e.preventDefault();
        if (currentIndex === -1) {
          targetIndex = 0;
        } else if (loop) {
          targetIndex = (currentIndex + 1) % validItems.length;
        } else {
          targetIndex = Math.min(currentIndex + 1, validItems.length - 1);
        }
      } else if (e.key === prevKey) {
        e.preventDefault();
        if (currentIndex === -1) {
          targetIndex = validItems.length - 1;
        } else if (loop) {
          targetIndex = (currentIndex - 1 + validItems.length) % validItems.length;
        } else {
          targetIndex = Math.max(currentIndex - 1, 0);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        targetIndex = validItems.length - 1;
      }

      const targetEntry = validItems[targetIndex];
      if (!targetEntry) return;

      targetEntry.el.focus();
      focusedKey(targetEntry.value);
    });
  };

  const derivedValue: DerivedValue<string | null | string[]> = multiple
    ? internalState.as((vals) => vals)
    : internalState.as((vals) => vals[0] ?? null);

  return {
    id,
    orientation,
    multiple,
    isDisabled,
    value: derivedValue,
    isSelected,
    getItemTabIndex,
    toggle,
    focusedKey,
    handleItemKeyDown,
    registerItem,
  };
}
