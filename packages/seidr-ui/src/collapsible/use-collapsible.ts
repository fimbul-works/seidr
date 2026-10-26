import { isFn, isUndef } from "@fimbul-works/hvat";
import { type CleanupFunction, createValue, isValue, unwrapValue, type Value } from "@fimbul-works/seidr";
import type { CollapsibleDataSet, UseCollapsibleResult } from "./types.js";

let idCounter = 0;

export const createCollapsibleId = (prefix = "collapsible"): string => `${prefix}-${++idCounter}`;

export interface UseCollapsibleOptions {
  /** The controlled open state of the collapsible. */
  open?: boolean | Value<boolean>;

  /** The default open state when initially rendered (uncontrolled). */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /** Whether the collapsible is disabled. */
  disabled?: boolean | Value<boolean>;

  /**
   * Used to force mounting the collapsible content when more control is needed
   * (e.g. for CSS animations or SEO).
   * @default false
   */
  forceMount?: boolean;

  /** Unique base identifier for the collapsible. */
  id?: string;
}

/**
 * Headless hook that provides state management and accessibility coordinates
 * for an interactive disclosure / collapsible widget.
 */
export function useCollapsible(options: UseCollapsibleOptions = {}): UseCollapsibleResult {
  const { open, defaultOpen, onOpenChange, disabled, forceMount = false, id: providedId } = options;

  const id = providedId ?? createCollapsibleId();
  const contentId = createValue<string>(`${id}-content`);

  const registerContentId = (newId: string): CleanupFunction => {
    contentId(newId);
    return () => {
      contentId(`${id}-content`);
    };
  };

  const isControlled = !isUndef(open);
  const isControlledValue = isValue(open);
  const isControlledStatic = isControlled && !isControlledValue;

  let state: Value<boolean>;
  if (isControlledValue) {
    state = open;
    if (isFn(onOpenChange)) {
      state.watch((val) => onOpenChange(val));
    }
  } else if (isControlledStatic) {
    state = createValue(Boolean(open));
  } else {
    state = createValue(Boolean(defaultOpen ?? false));
    if (isFn(onOpenChange)) {
      state.watch((val) => onOpenChange(val));
    }
  }

  const isDisabled = isValue(disabled)
    ? (disabled.as((d) => Boolean(d)) as Value<boolean>)
    : createValue(Boolean(disabled));

  const isBlocked = () => Boolean(unwrapValue(disabled));

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    if (isBlocked()) return;
    const current = state();
    const nextVal = typeof next === "function" ? next(current) : next;
    if (nextVal === current) return;

    if (isControlledStatic) {
      onOpenChange?.(nextVal);
    } else {
      state(nextVal);
    }
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const openFn = () => {
    setIsOpen(true);
  };

  const closeFn = () => {
    setIsOpen(false);
  };

  const dataset: CollapsibleDataSet = {
    "data-expanded": state.as((v) => (v ? "" : undefined)),
    "data-closed": state.as((v) => (!v ? "" : undefined)),
    "data-disabled": isDisabled.as((v) => (v ? "" : undefined)),
  };

  return {
    isOpen: state.as((v) => v),
    isDisabled,
    forceMount,
    id,
    contentId,
    registerContentId,
    setIsOpen,
    open: openFn,
    close: closeFn,
    toggle,
    dataset,
  };
}
