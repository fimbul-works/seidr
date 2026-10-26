import type { Value } from "@fimbul-works/seidr";
import { useControllableValue } from "./use-controllable-value.js";

export interface UseDisclosureStateProps {
  /** The value to be used, in controlled mode. */
  open?: boolean | Value<boolean>;

  /** The initial value to be used, in uncontrolled mode. */
  defaultOpen?: boolean;

  /** A function that will be called when the `isOpen` state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseDisclosureStateResult {
  /** The open state. Can be read via `isOpen()` or written via `isOpen(next)`. */
  isOpen: Value<boolean>;

  /** A setter function to manually set the open state. */
  setIsOpen: (next: boolean | ((prev: boolean) => boolean)) => void;

  /** A function to set the `isOpen` state to `true`. */
  open: () => void;

  /** A function to set the `isOpen` state to `false`. */
  close: () => void;

  /** A function to toggle the `isOpen` state between `true` and `false`. */
  toggle: () => void;
}

/**
 * Provides state management for open, close and toggle scenarios.
 * Used to control the "open state" of components like Collapsible, Dialog, Popover, etc.
 *
 * Ported from Kobalte's createDisclosureState primitive.
 */
export function useDisclosureState(props: UseDisclosureStateProps = {}): UseDisclosureStateResult {
  const isOpen = useControllableValue({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });

  return {
    isOpen,
    setIsOpen(next: boolean | ((prev: boolean) => boolean)) {
      isOpen(next);
    },
    open() {
      isOpen(true);
    },
    close() {
      isOpen(false);
    },
    toggle() {
      isOpen((prev) => !prev);
    },
  };
}
