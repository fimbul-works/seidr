import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type { PointerDownOutsideEvent } from "../hooks/use-interact-outside.js";
import type { PopperArrowProps, UsePopperOptions, UsePopperResult } from "../popper/types.js";

/** Configuration options for the headless `useTooltip` hook. */
export interface UseTooltipOptions extends Omit<UsePopperOptions, "anchorRef" | "contentRef"> {
  /** Unique identifier for the tooltip. */
  id?: string;

  /** Controlled open state of the tooltip. */
  open?: ReactiveValue<boolean>;

  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;

  /** Event handler called when the open state of the tooltip changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /** Whether the tooltip is disabled, independent of the trigger. */
  disabled?: ReactiveValue<boolean>;

  /**
   * Whether to open the tooltip only when the trigger receives keyboard focus.
   * By default (`false`), opens for both focus and hover.
   */
  triggerOnFocusOnly?: ReactiveValue<boolean>;

  /**
   * Duration in milliseconds from when the mouse enters the trigger until the tooltip opens.
   * @default 700
   */
  openDelay?: number;

  /**
   * Duration in milliseconds from when the mouse leaves the trigger or content until the tooltip closes.
   * @default 300
   */
  closeDelay?: number;

  /**
   * Duration in milliseconds during which moving to another tooltip skips `openDelay`.
   * @default 300
   */
  skipDelayDuration?: number;

  /** Whether to close the tooltip even if the cursor is inside the safe polygon between trigger and content. */
  ignoreSafeArea?: boolean;

  /** Whether to keep the tooltip content mounted when closed. */
  forceMount?: boolean;

  /** Optional target element to portal the tooltip content into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

/** Return interface of `useTooltip`. */
export interface UseTooltipResult {
  /** Unique component ID. */
  id: string;

  /** Deterministic ID for the tooltip content element. */
  contentId: Value<string>;

  /** Reactive open state. */
  isOpen: DerivedValue<boolean>;

  /** Reactive disabled state. */
  isDisabled: DerivedValue<boolean>;

  /** Reactive trigger-on-focus-only state. */
  triggerOnFocusOnly: DerivedValue<boolean>;

  /** Ref for the trigger element. */
  triggerRef: Ref<HTMLElement>;

  /** Ref for the floating content element. */
  contentRef: Ref<HTMLElement>;

  /** Headless Popper coordinator. */
  popper: UsePopperResult;

  /** Whether content should remain mounted when closed. */
  forceMount: boolean;

  /** Optional target element to portal the tooltip content into. */
  portalTarget?: HTMLElement;

  /** Opens the tooltip (optionally bypassing `openDelay`). */
  openTooltip: (immediate?: boolean) => void;

  /** Hides the tooltip (optionally bypassing `closeDelay`). */
  hideTooltip: (immediate?: boolean) => void;

  /** Cancels any pending warmup/open timer. */
  cancelOpening: () => void;

  /** Cancels any pending close timer. */
  cancelClosing: () => void;

  /** Checks if a DOM node is inside the trigger or tooltip content. */
  isTargetOnTooltip: (target: Node | null) => boolean;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface TooltipRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTooltipResult;
  dataComponent?: string;
}

export type TooltipRootProps<T extends keyof SeidrElementTagNameMap = "div"> = TooltipRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof TooltipRootOptions<T>>;

export interface TooltipTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseTooltipResult;
  dataComponent?: string;
  type?: "button" | "submit" | "reset";
  disabled?: ReactiveValue<boolean>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type TooltipTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = TooltipTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof TooltipTriggerOptions<T>>;

export interface TooltipContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTooltipResult;
  dataComponent?: string;
  /** Optional target element to portal the content into. Overrides `instance.portalTarget`. */
  portalTarget?: HTMLElement;
  /** Event handler called when the Escape key is pressed. Can be prevented via `event.preventDefault()`. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Event handler called when a pointer down event occurs outside the tooltip. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type TooltipContentProps<T extends keyof SeidrElementTagNameMap = "div"> = TooltipContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof TooltipContentOptions<T>>;

export interface TooltipPortalProps {
  /** Target element to portal into. Defaults to `instance.portalTarget ?? getDocument().body`. */
  target?: HTMLElement;
  instance?: UseTooltipResult;
}

export type TooltipArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperArrowProps<T>;

// ---------------------------------------------------------------------------
// Tier 2 Coordinator Instance Interface
// ---------------------------------------------------------------------------

export interface TooltipInstance extends UseTooltipResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TooltipRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<TooltipTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Portal: (props?: TooltipPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;

  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TooltipContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TooltipArrowProps<T>, "instance">,
  ) => SeidrElementTagNameMap[T];
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Component Props
// ---------------------------------------------------------------------------

export interface TooltipProps<T extends keyof SeidrElementTagNameMap = "div"> extends UseTooltipOptions {
  /** Polymorphic tag name for the root wrapper. Defaults to `"div"`. */
  as?: T;
  /** Trigger element or label content. */
  trigger?: SeidrChild | SeidrChild[];
  /** Tooltip body content (can also be passed as `children`). */
  content?: SeidrChild | SeidrChild[];
  /** Whether to render a PopperArrow inside the tooltip content. */
  showArrow?: boolean;
  /** Props forwarded to TooltipRoot. */
  rootProps?: Omit<TooltipRootProps<T>, "instance">;
  /** Props forwarded to TooltipTrigger. */
  triggerProps?: Omit<TooltipTriggerProps<"button">, "instance">;
  /** Props forwarded to TooltipContent. */
  contentProps?: Omit<TooltipContentProps<"div">, "instance">;
  /** Props forwarded to TooltipArrow. */
  arrowProps?: Omit<TooltipArrowProps<"div">, "instance">;
  /** Children rendered inside TooltipContent (when `content` is not provided). */
  children?: SeidrChild | SeidrChild[];
}

