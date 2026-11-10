import { isFn, isObj } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  mergeValues,
  type ObservableValue,
  onUnmounted,
  unwrapValue,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import type { ValidationState } from "../form-control/types.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import { useListbox } from "../listbox/use-listbox.js";
import { usePopper } from "../popper/use-popper.js";
import type {
  ComboboxFilter,
  ComboboxItemData,
  ComboboxNode,
  ComboboxSectionData,
  ComboboxTriggerMode,
  UseComboboxOptions,
  UseComboboxResult,
} from "./types.js";

let comboboxIdCounter = 0;
const nextComboboxId = () => `combobox-${++comboboxIdCounter}`;

const isSection = <T>(node: ComboboxNode<T>): node is ComboboxSectionData<T> => {
  return isObj(node) && "items" in node && Array.isArray((node as ComboboxSectionData<T>).items);
};

export const flattenItemNodes = <T>(nodes: ComboboxNode<T>[]): ComboboxItemData<T>[] => {
  const result: ComboboxItemData<T>[] = [];
  for (const node of nodes) {
    if (isSection(node)) {
      result.push(...node.items);
    } else {
      result.push(node);
    }
  }
  return result;
};

export function useCombobox<Option = any, OptGroup = any>(
  options: UseComboboxOptions<Option, OptGroup>,
): UseComboboxResult<Option> {
  const id = options.id ?? nextComboboxId();
  const controlId = `${id}-control`;
  const inputId = `${id}-input`;
  const triggerId = `${id}-trigger`;
  const listboxId = `${id}-listbox`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorMessageId = `${id}-error-message`;

  const controlRef = createRef<HTMLElement>();
  const inputRef = createRef<HTMLInputElement>();
  const triggerRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();
  const listboxRef = createRef<HTMLElement>();

  const triggerMode: ComboboxTriggerMode = options.triggerMode ?? "input";
  const multiple = Boolean(options.multiple);
  const closeOnSelection = options.closeOnSelection ?? !multiple;
  const removeOnBackspace = options.removeOnBackspace ?? true;
  const allowsEmptyCollection = Boolean(options.allowsEmptyCollection);
  const disallowEmptySelection = Boolean(options.disallowEmptySelection);
  const shouldFocusWrap = options.shouldFocusWrap ?? true;
  const forceMount = Boolean(options.forceMount);
  const name = options.name;
  const placeholder = options.placeholder;
  const onOpenChange = options.onOpenChange;

  const defaultFilter: ComboboxFilter<Option> = options.defaultFilter ?? "contains";

  const filterFn = (item: ComboboxItemData<Option>, query: string): boolean => {
    if (typeof defaultFilter === "function") {
      return defaultFilter(item, query);
    }
    const text = (item.textValue ?? String(item.label ?? item.value)).toLowerCase();
    switch (defaultFilter) {
      case "startsWith":
        return text.startsWith(query);
      case "endsWith":
        return text.endsWith(query);
      case "contains":
      default:
        return text.includes(query);
    }
  };

  const filterNodes = (nodes: ComboboxNode<Option>[], query: string): ComboboxNode<Option>[] => {
    const lower = query.toLowerCase().trim();
    if (!lower) return nodes;

    const res: ComboboxNode<Option>[] = [];
    for (const n of nodes) {
      if (isSection(n)) {
        const matching = n.items.filter((item) => filterFn(item, lower));
        if (matching.length > 0) {
          res.push({ ...n, items: matching });
        }
      } else {
        if (filterFn(n, lower)) {
          res.push(n);
        }
      }
    }
    return res;
  };

  // Popper settings
  const {
    placement = "bottom-start",
    gutter = 8,
    sameWidth = true,
    shift = 0,
    flip = true,
    slide = true,
    overlap = false,
    fitViewport = true,
    hideWhenDetached = false,
    detachedPadding = 0,
    arrowPadding = 4,
    overflowPadding = 8,
  } = options;

  // Form Control state derivations
  const isDisabled: DerivedValue<boolean> = isValue(options.disabled)
    ? (options.disabled as Value<boolean>).as(Boolean)
    : (wrapValue(Boolean(options.disabled)) as DerivedValue<boolean>);

  const isReadOnly: DerivedValue<boolean> = isValue(options.readOnly)
    ? (options.readOnly as Value<boolean>).as(Boolean)
    : (wrapValue(Boolean(options.readOnly)) as DerivedValue<boolean>);

  const isRequired: DerivedValue<boolean> = isValue(options.required)
    ? (options.required as Value<boolean>).as(Boolean)
    : (wrapValue(Boolean(options.required)) as DerivedValue<boolean>);

  const validationState: ObservableValue<ValidationState | undefined> = wrapValue(options.validationState);

  // Input Value State
  const inputValueInternal: Value<string> = isValue(options.inputValue)
    ? options.inputValue
    : createValue<string>(options.defaultInputValue ?? "");

  const setInputValue = (value: string) => {
    inputValueInternal(value);
    options.onInputChange?.(value);
    const inputEl = inputRef();
    if (inputEl && inputEl.value !== value) {
      inputEl.value = value;
    }
  };

  // Options State
  const allOptionsObservable = wrapValue(options.options) as ObservableValue<ComboboxNode<Option>[]>;
  const allOptions: DerivedValue<ComboboxNode<Option>[]> = isValue(allOptionsObservable)
    ? allOptionsObservable.as((opts) => opts ?? [])
    : (wrapValue([]) as unknown as DerivedValue<ComboboxNode<Option>[]>);

  const showAllOptions = createValue<boolean>(false);

  const displayedOptions: DerivedValue<ComboboxNode<Option>[]> = mergeValues(
    () => {
      const nodes = allOptions();
      const query = inputValueInternal();
      const showAll = showAllOptions();
      if (showAll || !query) {
        return nodes;
      }
      return filterNodes(nodes, query);
    },
    { parents: [allOptions, inputValueInternal, showAllOptions] },
  );

  // Helper value conversions
  const getItemValue = (v: unknown): string => {
    if (v !== null && typeof v === "object" && "value" in v) {
      return String((v as Record<string, unknown>).value);
    }
    return String(v);
  };

  const getSelectedArray = (vals: string | string[] | Set<string>): string[] => {
    if (Array.isArray(vals)) return vals;
    if (typeof vals === "string") return [vals];
    return Array.from(vals);
  };

  // Selection initialization
  const computeInitialSelected = (): string[] => {
    const rawVal = unwrapValue(options.value);
    if (rawVal !== undefined && rawVal !== null) {
      if (Array.isArray(rawVal)) {
        return rawVal.map(getItemValue);
      }
      return [getItemValue(rawVal)];
    }
    const def = options.defaultValue;
    if (def !== undefined && def !== null) {
      if (Array.isArray(def)) {
        return def.map(getItemValue);
      }
      return [getItemValue(def)];
    }
    return [];
  };

  const initialSelected = computeInitialSelected();
  const selectedValues = createValue<string | string[] | Set<string>>(initialSelected);

  // Sync if controlled value changes externally
  if (isValue(options.value)) {
    options.value.watch((next) => {
      if (next === undefined || next === null) {
        selectedValues([]);
      } else if (Array.isArray(next)) {
        selectedValues(next.map(getItemValue));
      } else {
        selectedValues([getItemValue(next)]);
      }
    });
  }

  // Selected options derived from selection keys and options tree
  const selectedOptions: DerivedValue<ComboboxItemData<Option>[]> = mergeValues(
    () => {
      const vals = getSelectedArray(selectedValues());
      const allItems = flattenItemNodes(allOptions());
      return vals
        .map((v) => allItems.find((i) => i.value === v))
        .filter((i): i is ComboboxItemData<Option> => i !== undefined);
    },
    { parents: [selectedValues, allOptions] },
  );

  // Initialize input text with selected label in single-selection mode if uncontrolled
  if (!multiple && options.defaultInputValue === undefined && !isValue(options.inputValue)) {
    const initialItems = flattenItemNodes(unwrapValue(options.options) ?? []);
    const matchingFirst = initialItems.find((i) => i.value === initialSelected[0]);
    if (matchingFirst) {
      inputValueInternal(String(matchingFirst.label ?? matchingFirst.value));
    }
  }

  const resetInputValue = () => {
    if (options.noResetInputOnBlur) return;
    if (multiple) {
      setInputValue("");
    } else {
      const sel = selectedOptions()[0];
      setInputValue(sel ? String(sel.label ?? sel.value) : "");
    }
  };

  // Open / Close state
  const isOpenInternal: Value<boolean> = isValue(options.open)
    ? options.open
    : createValue<boolean>(options.defaultOpen ?? false);

  const popper = usePopper({
    anchorRef: controlRef,
    contentRef: contentRef,
    placement,
    gutter,
    sameWidth,
    shift,
    flip,
    slide,
    overlap,
    fitViewport,
    hideWhenDetached,
    detachedPadding,
    arrowPadding,
    overflowPadding,
  });

  const listbox = useListbox({
    id: listboxId,
    selectionMode: multiple ? "multiple" : "single",
    disallowEmptySelection,
    shouldFocusWrap,
    shouldFocusOnHover: true,
    disallowTypeAhead: true,
    disabled: isDisabled,
    value: selectedValues,
    onChange: (valOrVals: string | string[]) => {
      const vals = Array.isArray(valOrVals) ? valOrVals : [valOrVals];
      selectedValues(vals);
      const allItems = flattenItemNodes(allOptions());
      const currentSelected = vals
        .map((v) => allItems.find((i) => i.value === v))
        .filter((i): i is ComboboxItemData<Option> => i !== undefined);

      if (options.onChange) {
        if (multiple) {
          options.onChange(currentSelected.map((i) => i.rawValue ?? i.value));
        } else {
          const singleItem = currentSelected[0];
          options.onChange(singleItem ? (singleItem.rawValue ?? singleItem.value) : null);
        }
      }

      if (closeOnSelection && vals.length > 0) {
        close();
      }

      resetInputValue();

      inClient(() => {
        const inputEl = inputRef();
        if (inputEl) {
          inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
          inputEl.focus();
        }
      });
    },
  });

  const activeDescendantId: DerivedValue<string | undefined> = mergeValues(
    () => {
      const focusedKey = listbox.highlightedValue();
      if (focusedKey && isOpenInternal()) {
        return `${id}-item-${focusedKey}`;
      }
      return undefined;
    },
    { parents: [listbox.highlightedValue, isOpenInternal] },
  );

  const isEmpty = selectedValues.as((vals) => getSelectedArray(vals).length === 0);

  const open = (focusStrategy: "first" | "last" | boolean = true, openMode?: ComboboxTriggerMode) => {
    if (isDisabled() || isReadOnly()) return;
    if (triggerMode === "manual" && openMode !== "manual") return;

    if (openMode === "manual") {
      showAllOptions(true);
    }

    const availableNodes = displayedOptions();
    if (availableNodes.length === 0 && !allowsEmptyCollection) {
      return;
    }

    if (!isOpenInternal()) {
      isOpenInternal(true);
      onOpenChange?.(true, openMode);
    }

    inClient(() => {
      popper.updatePosition();

      const allItems = flattenItemNodes(displayedOptions()).filter((i) => !i.disabled);
      if (allItems.length > 0) {
        const currentSelected = getSelectedArray(selectedValues());
        let targetKey: string | undefined;

        if (currentSelected.length > 0) {
          targetKey = currentSelected[0];
        } else if (focusStrategy === "last") {
          targetKey = allItems[allItems.length - 1]?.value;
        } else if (focusStrategy === "first" || focusStrategy === true) {
          targetKey = allItems[0]?.value;
        }

        if (targetKey) {
          listbox.highlightValue(targetKey);
        }
      }
    });
  };

  const close = () => {
    if (!isOpenInternal()) return;

    isOpenInternal(false);
    onOpenChange?.(false);
    listbox.highlightValue(null);
  };

  const toggle = (focusStrategy: "first" | "last" | boolean = true, openMode?: ComboboxTriggerMode) => {
    if (isOpenInternal()) {
      close();
    } else {
      open(focusStrategy, openMode);
    }
  };

  const remove = (optionOrValue: ComboboxItemData<Option> | string) => {
    const valToRemove = typeof optionOrValue === "string" ? optionOrValue : optionOrValue.value;
    const current = getSelectedArray(selectedValues());
    const next = current.filter((v) => v !== valToRemove);
    selectedValues(next);

    if (options.onChange) {
      const allItems = flattenItemNodes(allOptions());
      const selected = next
        .map((v) => allItems.find((i) => i.value === v))
        .filter((i): i is ComboboxItemData<Option> => i !== undefined);
      if (multiple) {
        options.onChange(selected.map((i) => i.rawValue ?? i.value));
      } else {
        const single = selected[0];
        options.onChange(single ? (single.rawValue ?? single.value) : null);
      }
    }
  };

  const clear = () => {
    selectedValues([]);
    if (options.onChange) {
      options.onChange(multiple ? [] : null);
    }
    resetInputValue();
  };

  // Form Reset Listener
  useFormResetListener(inputRef, () => {
    selectedValues(initialSelected);
    resetInputValue();
    if (options.onChange) {
      const allItems = flattenItemNodes(allOptions());
      const currentSelected = initialSelected
        .map((v) => allItems.find((i) => i.value === v))
        .filter((i): i is ComboboxItemData<Option> => i !== undefined);
      if (multiple) {
        options.onChange(currentSelected.map((i) => i.rawValue ?? i.value));
      } else {
        const single = currentSelected[0];
        options.onChange(single ? (single.rawValue ?? single.value) : null);
      }
    }
  });

  // Dismissal listeners (pointerdown outside)
  inClient(() => {
    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (!isOpenInternal()) return;

      const target = e.target as Node | null;
      if (!target) return;

      const controlEl = controlRef();
      const contentEl = contentRef();

      if (controlEl && (controlEl === target || controlEl.contains(target))) {
        return;
      }

      if (contentEl && (contentEl === target || contentEl.contains(target))) {
        return;
      }

      close();
      resetInputValue();
    };

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (!isOpenInternal()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        resetInputValue();
      }
    };

    isOpenInternal.bind((isOpen) => {
      if (isOpen) {
        document.addEventListener("pointerdown", handleOutsidePointerDown);
        document.addEventListener("keydown", handleDocumentKeyDown);
      } else {
        document.removeEventListener("pointerdown", handleOutsidePointerDown);
        document.removeEventListener("keydown", handleDocumentKeyDown);
      }
    });

    onUnmounted(() => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  // Input & Trigger Event Handlers
  const handleInput = (e: Event) => {
    if (isDisabled() || isReadOnly()) return;
    const target = e.target as HTMLInputElement;
    const nextVal = target.value;

    showAllOptions(false);
    setInputValue(nextVal);

    // If single selection uncontrolled, typing empty clears selection
    if (nextVal === "" && !multiple && !disallowEmptySelection && options.value === undefined) {
      selectedValues([]);
      if (options.onChange) {
        options.onChange(null);
      }
    }

    if (isOpenInternal()) {
      if (displayedOptions().length === 0 && !allowsEmptyCollection) {
        close();
      }
    } else {
      if (displayedOptions().length > 0 || allowsEmptyCollection) {
        open(false, "input");
      }
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (isDisabled() || isReadOnly()) return;

    switch (e.key) {
      case "Enter":
        if (isOpenInternal()) {
          e.preventDefault();
          const highlighted = listbox.highlightedValue();
          if (highlighted) {
            listbox.toggleOrSelect(highlighted);
          }
        }
        break;

      case "Tab":
        if (isOpenInternal()) {
          close();
          resetInputValue();
        }
        break;

      case "Escape":
        if (isOpenInternal()) {
          e.preventDefault();
          e.stopPropagation();
          close();
          resetInputValue();
        } else {
          setInputValue("");
        }
        break;

      case "ArrowDown":
        if (!isOpenInternal()) {
          e.preventDefault();
          open(e.altKey ? false : "first", "manual");
        } else {
          listbox.handleRootKeyDown(e);
        }
        break;

      case "ArrowUp":
        if (!isOpenInternal()) {
          e.preventDefault();
          open("last", "manual");
        } else {
          if (e.altKey) {
            e.preventDefault();
            close();
            resetInputValue();
          } else {
            listbox.handleRootKeyDown(e);
          }
        }
        break;

      case "Backspace":
        if (removeOnBackspace && multiple && inputValueInternal() === "") {
          const current = getSelectedArray(selectedValues());
          if (current.length > 0) {
            const lastVal = current[current.length - 1];
            if (lastVal) {
              remove(lastVal);
            }
          }
        }
        break;
    }
  };

  const handleInputFocus = (_e: FocusEvent) => {
    if (isDisabled() || isReadOnly()) return;
    if (triggerMode === "focus" && !isOpenInternal()) {
      open(false, "focus");
    }
  };

  const handleInputBlur = (e: FocusEvent) => {
    const related = e.relatedTarget as Node | null;
    const controlEl = controlRef();
    const contentEl = contentRef();

    if (controlEl && related && controlEl.contains(related)) {
      return;
    }
    if (contentEl && related && contentEl.contains(related)) {
      return;
    }

    if (isOpenInternal()) {
      close();
    }
    resetInputValue();
  };

  const handleInputClick = (_e: MouseEvent) => {
    if (isDisabled() || isReadOnly()) return;
    if (triggerMode === "focus" && !isOpenInternal()) {
      open(false, "focus");
    }
  };

  const handleTriggerPointerDown = (e: PointerEvent) => {
    if (isDisabled() || isReadOnly()) return;
    // Prevent trigger button from stealing focus from input
    e.preventDefault();
    toggle(false, "manual");
  };

  const handleTriggerClick = (_e: MouseEvent) => {
    if (isDisabled() || isReadOnly()) return;
    inputRef()?.focus();
  };

  return {
    id,
    controlId,
    inputId,
    triggerId,
    listboxId,
    labelId,
    descriptionId,
    errorMessageId,
    controlRef,
    inputRef,
    triggerRef,
    contentRef,
    listboxRef,
    isOpen: isOpenInternal,
    open,
    close,
    toggle,
    inputValue: inputValueInternal,
    setInputValue,
    resetInputValue,
    isDisabled,
    isReadOnly,
    isRequired,
    isMultiple: multiple,
    name,
    validationState,
    placeholder,
    isEmpty,
    allOptions,
    displayedOptions,
    selectedOptions,
    remove,
    clear,
    listbox,
    popper,
    forceMount,
    portalTarget: options.portalTarget,
    activeDescendantId,
    handleInput,
    handleInputKeyDown,
    handleInputFocus,
    handleInputBlur,
    handleInputClick,
    handleTriggerPointerDown,
    handleTriggerClick,
  };
}
