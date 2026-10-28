import type { CleanupFunction, DerivedValue, ObservableValue } from "@fimbul-works/seidr";

export interface CollapsibleDataSet {
  "data-expanded": ObservableValue<string | undefined>;
  "data-closed": ObservableValue<string | undefined>;
  "data-disabled": ObservableValue<string | undefined>;
}

export interface UseCollapsibleResult {
  /** The derived read-only open state. */
  isOpen: DerivedValue<boolean>;

  /** The derived read-only disabled state. */
  isDisabled: ObservableValue<boolean>;

  /** Whether the collapsible is force mounted in the DOM. */
  forceMount?: ObservableValue<boolean>;

  /** The base ID of the collapsible. */
  id: string;

  /** The reactive content ID. */
  contentId: ObservableValue<string>;

  /** Registers or overrides the content element ID. */
  registerContentId: (id: string) => CleanupFunction;

  /** Sets the open state manually (guarded by disabled). */
  setIsOpen: (next: boolean | ((prev: boolean) => boolean)) => void;

  /** Opens the collapsible (guarded by disabled). */
  open: () => void;

  /** Closes the collapsible (guarded by disabled). */
  close: () => void;

  /** Toggles the collapsible open/closed (guarded by disabled). */
  toggle: () => void;

  /** Reactive data-* attributes for Root, Trigger, and Content. */
  dataset: CollapsibleDataSet;
}
