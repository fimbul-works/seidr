import { isArr, isFn, isNullish, isNum, isObj, isStr } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  mergeValues,
  onUnmounted,
  unwrapValue,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import { useListbox } from "../listbox/use-listbox.js";
import { usePopper } from "../popper/use-popper.js";
import type {
  SelectItemData,
  SelectNode,
  UseSelectOptions,
  UseSelectResult,
} from "./types.js";

function normalizeOptions<Option, OptGroup>(
  rawList: Array<Option | OptGroup | SelectNode<Option>>,
  config: {
    optionValue?: keyof Option | ((opt: Option) => string);
    optionTextValue?: keyof Option | ((opt: Option) => string);
    optionDisabled?: keyof Option | ((opt: Option) => boolean);
    optionGroupChildren?: keyof OptGroup | ((grp: OptGroup) => Option[]);
  },
): SelectNode<Option>[] {
  const result: SelectNode<Option>[] = [];

  for (const item of rawList) {
    if (isNullish(item)) continue;

    // Primitives: string or number
    if (isStr(item) || isNum(item)) {
      const val = String(item);
      result.push({
        type: "item",
        value: val,
        label: val,
        textValue: val,
        disabled: false,
        rawValue: item as unknown as Option,
      });
      continue;
    }

    if (isObj(item)) {
      const asAny = item as Record<string, any>;

      // Check if section
      let sectionChildren: Option[] | undefined;
      if (config.optionGroupChildren) {
        sectionChildren = isFn(config.optionGroupChildren)
          ? config.optionGroupChildren(item as unknown as OptGroup)
          : asAny[config.optionGroupChildren as string];
      } else if (asAny.type === "section" || isArr(asAny.items)) {
        sectionChildren = asAny.items;
      }

      if (isArr(sectionChildren)) {
        const key = String(asAny.key ?? asAny.id ?? asAny.label ?? `sec-${result.length}`);
        const label = asAny.label ?? key;
        const childNodes = normalizeOptions<Option, OptGroup>(sectionChildren, config) as SelectItemData<Option>[];
        result.push({
          type: "section",
          key,
          label,
          items: childNodes,
          rawValue: item as unknown as Option,
        });
        continue;
      }

      // Single item
      let val: string;
      if (config.optionValue) {
        val = String(isFn(config.optionValue) ? config.optionValue(item as unknown as Option) : asAny[config.optionValue as string]);
      } else if ("value" in asAny) {
        val = String(asAny.value);
      } else {
        val = String(item);
      }

      let txt: string;
      if (config.optionTextValue) {
        txt = String(isFn(config.optionTextValue) ? config.optionTextValue(item as unknown as Option) : asAny[config.optionTextValue as string]);
      } else if ("textValue" in asAny && isStr(asAny.textValue)) {
        txt = asAny.textValue;
      } else if ("label" in asAny && (isStr(asAny.label) || isNum(asAny.label))) {
        txt = String(asAny.label);
      } else {
        txt = val;
      }

      let dis = false;
      if (config.optionDisabled) {
        dis = Boolean(isFn(config.optionDisabled) ? config.optionDisabled(item as unknown as Option) : asAny[config.optionDisabled as string]);
      } else if ("disabled" in asAny) {
        dis = Boolean(asAny.disabled);
      }

      const label = asAny.label ?? txt;

      result.push({
        type: "item",
        value: val,
        label,
        textValue: txt,
        disabled: dis,
        description: asAny.description,
        rawValue: item as unknown as Option,
      });
    }
  }

  return result;
}

/** Flatten all item nodes from a hierarchical select node list */
function flattenItemNodes<Option>(nodes: SelectNode<Option>[]): SelectItemData<Option>[] {
  const result: SelectItemData<Option>[] = [];
  for (const node of nodes) {
    if (node.type === "section") {
      result.push(...flattenItemNodes(node.items));
    } else {
      result.push(node);
    }
  }
  return result;
}

/**
 * Headless reactive coordinator for an accessible WAI-ARIA Select dropdown.
 */
export function useSelect<Option = any, OptGroup = any>(
  options: UseSelectOptions<Option, OptGroup> = {},
): UseSelectResult<Option> {
  const {
    id: customId,
    defaultOpen = false,
    onOpenChange,
    multiple = false,
    closeOnSelection = !multiple,
    disallowEmptySelection = false,
    shouldFocusWrap = true,
    shouldFocusOnHover = true,
    disallowTypeAhead = false,
    name,
    validationState,
    placeholder,
    forceMount = false,
    placement = "bottom-start",
    gutter = 8,
    sameWidth = true,
    shift = 0,
    flip = true,
    slide = true,
    overlap = false,
    fitViewport = false,
    hideWhenDetached = false,
    detachedPadding = 0,
    arrowPadding = 4,
    overflowPadding = 8,
  } = options;

  const id = customId ?? useId("select");
  const triggerId = `${id}-trigger`;
  const valueId = `${id}-value`;
  const listboxId = `${id}-listbox`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorMessageId = `${id}-error-message`;

  const triggerRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();
  const listboxRef = createRef<HTMLElement>();

  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = disabledObservable.as(Boolean);

  const readOnlyObservable = wrapValue(options.readOnly ?? false);
  const isReadOnly: DerivedValue<boolean> = readOnlyObservable.as(Boolean);

  const requiredObservable = wrapValue(options.required ?? false);
  const isRequired: DerivedValue<boolean> = requiredObservable.as(Boolean);

  // Controlled or uncontrolled open state
  const isOpenInternal = createValue<boolean>(
    Boolean(unwrapValue(options.open) ?? defaultOpen),
  );
  if (isValue(options.open)) {
    options.open.watch((next) => isOpenInternal(Boolean(next)));
  }

  const rawOptionsObservable = wrapValue(options.options ?? []);
  const normalizedOptions = rawOptionsObservable.as((rawList) =>
    normalizeOptions(rawList ?? [], {
      optionValue: options.optionValue,
      optionTextValue: options.optionTextValue,
      optionDisabled: options.optionDisabled,
      optionGroupChildren: options.optionGroupChildren,
    }),
  );

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

  // Value normalization for Listbox
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

  const listbox = useListbox({
    id: listboxId,
    selectionMode: multiple ? "multiple" : "single",
    disallowEmptySelection,
    shouldFocusWrap,
    shouldFocusOnHover,
    disallowTypeAhead,
    disabled: isDisabled,
    value: selectedValues,
    onChange: (valOrVals: string | string[]) => {
      const vals = Array.isArray(valOrVals) ? valOrVals : [valOrVals];
      selectedValues(vals);
      const allItems = flattenItemNodes(normalizedOptions());
      const selectedItems = vals
        .map((v) => allItems.find((i) => i.value === v))
        .filter(Boolean) as SelectItemData<Option>[];

      if (options.onChange) {
        if (multiple) {
          const resultValues = selectedItems.map((i) => i.rawValue ?? i.value);
          options.onChange(resultValues);
        } else {
          const singleItem = selectedItems[0];
          options.onChange(singleItem ? (singleItem.rawValue ?? singleItem.value) : null);
        }
      }

      if (closeOnSelection) {
        close();
      }
    },
  });

  const popper = usePopper({
    anchorRef: triggerRef,
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

  const isEmpty = selectedValues.as((vals) => getSelectedArray(vals).length === 0);

  const open = (focusStrategy: "first" | "last" | boolean = true) => {
    if (isDisabled() || isReadOnly() || isOpenInternal()) return;

    isOpenInternal(true);
    onOpenChange?.(true);

    inClient(() => {
      popper.updatePosition();

      // Focus first/last or selected item
      const allItems = flattenItemNodes(normalizedOptions()).filter((i) => !i.disabled);
      if (allItems.length > 0) {
        const currentSelected = getSelectedArray(selectedValues());
        let targetKey: string | undefined;

        if (currentSelected.length > 0) {
          targetKey = currentSelected[0];
        } else if (focusStrategy === "last") {
          targetKey = allItems[allItems.length - 1]?.value;
        } else {
          targetKey = allItems[0]?.value;
        }

        if (targetKey) {
          listbox.highlightValue(targetKey);
        }
      }

      listboxRef()?.focus();
    });
  };

  const close = () => {
    if (!isOpenInternal()) return;

    isOpenInternal(false);
    onOpenChange?.(false);

    inClient(() => {
      triggerRef()?.focus();
    });
  };

  const toggle = (focusStrategy: "first" | "last" | boolean = true) => {
    if (isOpenInternal()) {
      close();
    } else {
      open(focusStrategy);
    }
  };

  // Form Reset Listener
  useFormResetListener(triggerRef, () => {
    selectedValues(initialSelected);
    if (options.onChange) {
      const allItems = flattenItemNodes(normalizedOptions());
      const selectedItems = initialSelected
        .map((v) => allItems.find((i) => i.value === v))
        .filter(Boolean) as SelectItemData<Option>[];
      if (multiple) {
        options.onChange(selectedItems.map((i) => i.rawValue ?? i.value));
      } else {
        const singleItem = selectedItems[0];
        options.onChange(singleItem ? (singleItem.rawValue ?? singleItem.value) : null);
      }
    }
  });

  // Dismissal listeners (click outside & escape key)
  inClient(() => {
    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (!isOpenInternal()) return;

      const target = e.target as Node | null;
      if (!target) return;

      const triggerEl = triggerRef();
      const contentEl = contentRef();

      if (triggerEl && (triggerEl === target || triggerEl.contains(target))) {
        return;
      }

      if (contentEl && (contentEl === target || contentEl.contains(target))) {
        return;
      }

      close();
    };

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (!isOpenInternal()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
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

  // Closed Trigger Keyboard Navigation (Typeahead & ArrowLeft / ArrowRight)
  let typeaheadBuffer = "";
  let typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (isDisabled() || isReadOnly()) return;

    if (!isOpenInternal()) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        open("first");
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        open("last");
        return;
      }

      // Single select closed arrow cycling
      if (!multiple && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        const allItems = flattenItemNodes(normalizedOptions()).filter((i) => !i.disabled);
        if (allItems.length === 0) return;

        const currentVal = getSelectedArray(selectedValues())[0];
        const currentIndex = allItems.findIndex((i) => i.value === currentVal);

        let nextIndex: number;
        if (e.key === "ArrowLeft") {
          nextIndex = currentIndex <= 0 ? (shouldFocusWrap ? allItems.length - 1 : 0) : currentIndex - 1;
        } else {
          nextIndex = currentIndex >= allItems.length - 1 ? (shouldFocusWrap ? 0 : allItems.length - 1) : currentIndex + 1;
        }

        const nextItem = allItems[nextIndex];
        if (nextItem) {
          listbox.toggleOrSelect(nextItem.value);
        }
        return;
      }

      // Typeahead search while closed
      if (!disallowTypeAhead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (typeaheadTimeout) clearTimeout(typeaheadTimeout);
        typeaheadBuffer += e.key.toLowerCase();
        typeaheadTimeout = setTimeout(() => {
          typeaheadBuffer = "";
        }, 500);

        const allItems = flattenItemNodes(normalizedOptions()).filter((i) => !i.disabled);
        const match = allItems.find((i) =>
          (i.textValue ?? String(i.label ?? i.value)).toLowerCase().startsWith(typeaheadBuffer),
        );
        if (match) {
          listbox.toggleOrSelect(match.value);
        }
      }
    }
  };

  const handleTriggerPointerDown = (e: PointerEvent) => {
    if (isDisabled() || isReadOnly()) return;
    if (e.pointerType !== "touch" && e.button === 0) {
      e.preventDefault();
      toggle();
    }
  };

  const handleTriggerClick = (e: MouseEvent) => {
    if (isDisabled() || isReadOnly()) return;
    // Handle touch activation or accessibility click without pointerdown
    const pointerType = "pointerType" in e ? (e as PointerEvent).pointerType : undefined;
    if (pointerType === "touch" || e.detail === 0) {
      toggle();
    }
  };

  const ariaLabelledBy: DerivedValue<string | undefined> = mergeValues(() => {
    return `${labelId} ${valueId}`;
  });

  return {
    id,
    triggerId,
    valueId,
    listboxId,
    labelId,
    descriptionId,
    errorMessageId,
    triggerRef,
    contentRef,
    listboxRef,
    isOpen: isOpenInternal,
    open,
    close,
    toggle,
    isDisabled,
    isReadOnly,
    isRequired,
    isMultiple: multiple,
    name,
    validationState,
    placeholder,
    isEmpty,
    normalizedOptions,
    listbox,
    popper,
    forceMount,
    portalTarget: options.portalTarget,
    ariaLabelledBy,
    closeOnSelection,
    handleTriggerKeyDown,
    handleTriggerPointerDown,
    handleTriggerClick,
  };
}
