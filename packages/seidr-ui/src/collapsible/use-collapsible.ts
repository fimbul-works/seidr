import { isFn, isUndef } from "@fimbul-works/hvat";
import {
  type CleanupFunction,
  createValue,
  isValue,
  type ObservableValue,
  type ReactiveValue,
  unwrapValue,
  useId,
  type Value,
} from "@fimbul-works/seidr";
import type { CollapsibleDataSet, UseCollapsibleResult } from "./types.js";

export interface UseCollapsibleOptions {
  /** The controlled open state of the collapsible. */
  open?: boolean | ObservableValue<boolean>;

  /** The default open state when initially rendered (uncontrolled). */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /** Whether the collapsible is disabled. */
  disabled?: ReactiveValue<boolean>;

  /**
   * Used to force mounting the collapsible content when more control is needed.
   */
  forceMount?: ObservableValue<boolean>;

  /** Unique base identifier for the collapsible. */
  id?: string;
}

/**
 * Headless hook that provides state management and accessibility coordinates
 * for an interactive disclosure / collapsible widget.
 */
export function useCollapsible(options: UseCollapsibleOptions = {}): UseCollapsibleResult {
  const { open, defaultOpen, onOpenChange, disabled, forceMount, id: providedId } = options;

  const id = providedId ?? useId("collapsible");
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

  const state: Value<boolean> = isControlledValue
    ? open
    : isControlledStatic
      ? createValue(!!open)
      : createValue(!!(defaultOpen ?? false));

  if (isFn(onOpenChange)) {
    state.watch(onOpenChange);
  }

  const isDisabled = isValue(disabled) ? disabled.as((d) => !!d) : createValue(!!disabled);

  const isBlocked = () => !!unwrapValue(disabled);

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    if (isBlocked()) return;
    const current = state();
    const nextVal = isFn(next) ? next(current) : next;
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
