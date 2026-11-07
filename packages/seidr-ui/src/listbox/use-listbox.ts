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
import type { ListboxItemRegistration, UseListboxOptions, UseListboxResult } from "./types.js";

/**
 * Normalizes user input values (string, array, Set) into a string array.
 */
function normalizeValues(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (typeof raw === "string") return raw ? [raw] : [];
  if (Array.isArray(raw)) return raw.map(String);
  if (raw instanceof Set) return Array.from(raw).map(String);
  if (typeof (raw as Iterable<string>)[Symbol.iterator] === "function") {
    return Array.from(raw as Iterable<string>).map(String);
  }
  return [];
}

/**
 * Headless reactive coordinator for an accessible WAI-ARIA Listbox (`role="listbox"`).
 */
export function useListbox(options: UseListboxOptions = {}): UseListboxResult {
  const {
    id: customId,
    selectionMode = "single",
    disallowEmptySelection = false,
    shouldFocusWrap = true,
    shouldFocusOnHover = true,
    orientation = "vertical",
    disallowTypeAhead = false,
    autoFocus = false,
  } = options;

  const id = customId ?? useId("listbox");
  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = disabledObservable.as(Boolean);

  const computeInitialSelected = (): string[] => {
    const rawVal = unwrapValue(options.value);
    if (rawVal !== undefined) {
      return normalizeValues(rawVal);
    }
    const def = options.defaultValue;
    if (def !== undefined) {
      return normalizeValues(def);
    }
    return [];
  };

  const initialSelected = computeInitialSelected();
  const selectedValues: Value<string[]> = createValue<string[]>(initialSelected);

  // Sync if controlled value changes externally
  if (isValue(options.value)) {
    options.value.watch((nextVal) => {
      selectedValues(normalizeValues(nextVal));
    });
  }

  const highlightedValue: Value<string | null> = createValue<string | null>(initialSelected[0] ?? null);

  const items: ListboxItemRegistration[] = [];

  const isSelected = (value: string): DerivedValue<boolean> => {
    if (selectionMode === "none") {
      return disabledObservable.as(() => false);
    }
    return selectedValues.as((vals) => vals.includes(value));
  };

  const isHighlighted = (value: string): DerivedValue<boolean> => {
    return highlightedValue.as((curr) => curr === value);
  };

  const getItemTabIndex = (value: string, isItemDisabled: () => boolean): DerivedValue<number> => {
    return mergeValues(
      () => {
        if (isDisabled() || isItemDisabled()) {
          return -1;
        }

        const currentHighlighted = highlightedValue();
        if (currentHighlighted !== null) {
          return currentHighlighted === value ? 0 : -1;
        }

        // Fallback: first selected item or first registered enabled item
        const selected = selectedValues();
        if (selected.length > 0) {
          return selected[0] === value ? 0 : -1;
        }

        const firstEnabled = items.find((item) => !item.isItemDisabled());
        if (firstEnabled) {
          return firstEnabled.value === value ? 0 : -1;
        }

        return 0;
      },
      { parents: [isDisabled, selectedValues, highlightedValue] },
    );
  };

  const highlightValue = (value: string | null) => {
    highlightedValue(value);
  };

  const toggleOrSelect = (value: string) => {
    if (isDisabled() || selectionMode === "none") return;

    const entry = items.find((item) => item.value === value);
    if (entry?.isItemDisabled()) return;

    const current = selectedValues();
    const notifyChange = options.onValueChange ?? options.onChange;

    if (selectionMode === "multiple") {
      let nextList: string[];
      if (current.includes(value)) {
        if (disallowEmptySelection && current.length <= 1) return;
        nextList = current.filter((k) => k !== value);
      } else {
        nextList = [...current, value];
      }
      selectedValues(nextList);
      highlightedValue(value);
      notifyChange?.(nextList);
    } else {
      // Single selection
      if (current.includes(value)) {
        if (disallowEmptySelection) return;
      }
      const nextList = [value];
      selectedValues(nextList);
      highlightedValue(value);
      notifyChange?.(value);
    }
  };

  const moveFocus = (direction: "next" | "prev" | "first" | "last") => {
    const enabled = items.filter((it) => !it.isItemDisabled());
    if (enabled.length === 0) return;

    let target: ListboxItemRegistration | undefined;
    const current = highlightedValue();
    const currentIdx = enabled.findIndex((it) => it.value === current);

    switch (direction) {
      case "first":
        target = enabled[0];
        break;
      case "last":
        target = enabled[enabled.length - 1];
        break;
      case "next":
        if (currentIdx === -1) {
          target = enabled[0];
        } else if (currentIdx < enabled.length - 1) {
          target = enabled[currentIdx + 1];
        } else if (shouldFocusWrap) {
          target = enabled[0];
        }
        break;
      case "prev":
        if (currentIdx === -1) {
          target = enabled[enabled.length - 1];
        } else if (currentIdx > 0) {
          target = enabled[currentIdx - 1];
        } else if (shouldFocusWrap) {
          target = enabled[enabled.length - 1];
        }
        break;
    }

    if (target) {
      highlightedValue(target.value);
      inClient(() => {
        target.el.focus?.();
      });
    }
  };

  let typeaheadBuffer = "";
  let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  const handleTypeahead = (char: string) => {
    if (disallowTypeAhead) return;

    if (typeaheadTimer) {
      clearTimeout(typeaheadTimer);
    }

    typeaheadBuffer += char.toLowerCase();
    typeaheadTimer = setTimeout(() => {
      typeaheadBuffer = "";
    }, 500);

    const enabled = items.filter((it) => !it.isItemDisabled());
    if (enabled.length === 0) return;

    const current = highlightedValue();
    const currentIdx = enabled.findIndex((it) => it.value === current);

    // Search starting from item after current, then wrap to beginning
    const searchOrder = [...enabled.slice(currentIdx + 1), ...enabled.slice(0, Math.max(0, currentIdx + 1))];

    const match = searchOrder.find((it) => {
      const text = it.textValue().trim().toLowerCase();
      return text.startsWith(typeaheadBuffer);
    });

    if (match) {
      highlightedValue(match.value);
      inClient(() => {
        match.el.focus?.();
      });
    }
  };

  const handleKeyboardEvent = (e: KeyboardEvent) => {
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    if (e.key === nextKey || (!isHorizontal && e.key === "ArrowDown")) {
      e.preventDefault();
      moveFocus("next");
    } else if (e.key === prevKey || (!isHorizontal && e.key === "ArrowUp")) {
      e.preventDefault();
      moveFocus("prev");
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus("first");
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus("last");
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const current = highlightedValue();
      if (current !== null) {
        toggleOrSelect(current);
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
      handleTypeahead(e.key);
    }
  };

  const handleRootKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || (e as unknown as { _listboxHandled?: boolean })._listboxHandled) return;
    handleKeyboardEvent(e);
  };

  const handleItemKeyDown = (e: KeyboardEvent, value: string) => {
    if (e.defaultPrevented || (e as unknown as { _listboxHandled?: boolean })._listboxHandled) return;
    (e as unknown as { _listboxHandled?: boolean })._listboxHandled = true;
    highlightedValue(value);
    handleKeyboardEvent(e);
  };

  const handleRootFocus = (e: FocusEvent) => {
    // Only intercept if focus is explicitly entering the container or not already on an item
    const targetIsItem = items.some((it) => it.el === e.target);
    if (targetIsItem) return;

    const current = highlightedValue();
    const targetEntry =
      items.find((it) => it.value === current && !it.isItemDisabled()) ??
      items.find((it) => selectedValues().includes(it.value) && !it.isItemDisabled()) ??
      items.find((it) => !it.isItemDisabled());

    if (targetEntry) {
      highlightedValue(targetEntry.value);
      inClient(() => {
        targetEntry.el.focus?.();
      });
    }
  };

  const registerItem = (entry: ListboxItemRegistration): (() => void) => {
    items.push(entry);

    if (highlightedValue() === null && !entry.isItemDisabled()) {
      if (selectedValues().includes(entry.value) || selectedValues().length === 0) {
        highlightedValue(entry.value);
      }
    }

    if (autoFocus && items.length === 1 && !entry.isItemDisabled()) {
      inClient(() => {
        entry.el.focus?.();
      });
    }

    return () => {
      const idx = items.indexOf(entry);
      if (idx !== -1) {
        items.splice(idx, 1);
      }
      if (highlightedValue() === entry.value) {
        const nextEnabled = items.find((item) => !item.isItemDisabled());
        highlightedValue(nextEnabled?.value ?? null);
      }
    };
  };

  return {
    id,
    orientation,
    selectionMode,
    shouldFocusWrap,
    shouldFocusOnHover,
    disallowTypeAhead,
    selectedValues,
    highlightedValue,
    isDisabled,
    isSelected,
    isHighlighted,
    getItemTabIndex,
    toggleOrSelect,
    highlightValue,
    registerItem,
    handleRootKeyDown,
    handleItemKeyDown,
    handleRootFocus,
  };
}
