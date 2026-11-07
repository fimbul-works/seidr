import type {
  DerivedValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { PointerDownOutsideEvent } from "../hooks/use-interact-outside.js";
import type { PopperArrowProps, UsePopperOptions, UsePopperResult } from "../popper/types.js";

/** Configuration options for the headless `useHoverCard` hook. */
export interface UseHoverCardOptions extends Omit<UsePopperOptions, "anchorRef" | "contentRef"> {
  /** Unique identifier for the hover card. */
  id?: string;

  /** Controlled open state of the hover card. */
  open?: ReactiveValue<boolean>;

  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;

  /** Event handler called when the open state of the hover card changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Duration in milliseconds from when the mouse enters the trigger until the hover card opens.
   * @default 700
   */
  openDelay?: number;

  /**
   * Duration in milliseconds from when the mouse leaves the trigger or content until the hover card closes.
   * @default 300
   */
  closeDelay?: number;

  /** Whether to close the hover card even if the cursor is inside the safe polygon between trigger and content. */
  ignoreSafeArea?: boolean;

  /** Whether to keep the hover card content mounted when closed. */
  forceMount?: boolean;

  /** Optional target element to portal the hover card content into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

/** Return interface of `useHoverCard`. */
export interface UseHoverCardResult {
  /** Unique component ID. */
  id: string;

  /** Reactive open state. */
  isOpen: DerivedValue<boolean>;

  /** Ref for the trigger element. */
  triggerRef: Ref<HTMLElement>;

  /** Ref for the floating content element. */
  contentRef: Ref<HTMLElement>;

  /** Headless Popper coordinator. */
  popper: UsePopperResult;

  /** Whether content should remain mounted when closed. */
  forceMount: boolean;

  /** Optional target element to portal the hover card content into. */
  portalTarget?: HTMLElement;

  /** Opens the hover card after `openDelay`. */
  openWithDelay: () => void;

  /** Closes the hover card after `closeDelay`. */
  closeWithDelay: () => void;

  /** Cancels any pending open timer. */
  cancelOpening: () => void;

  /** Cancels any pending close timer. */
  cancelClosing: () => void;

  /** Immediately opens the hover card. */
  open: () => void;

  /** Immediately closes the hover card. */
  close: () => void;

  /** Checks if a DOM node is inside the trigger or hover card content. */
  isTargetOnHoverCard: (target: Node | null) => boolean;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface HoverCardRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseHoverCardResult;
  dataComponent?: string;
}

export type HoverCardRootProps<T extends keyof SeidrElementTagNameMap = "div"> = HoverCardRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof HoverCardRootOptions<T>>;

export interface HoverCardTriggerOptions<T extends keyof SeidrElementTagNameMap = "a"> {
  as?: T;
  instance?: UseHoverCardResult;
  dataComponent?: string;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: ReactiveValue<boolean>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type HoverCardTriggerProps<T extends keyof SeidrElementTagNameMap = "a"> = HoverCardTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof HoverCardTriggerOptions<T>>;

export interface HoverCardContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseHoverCardResult;
  dataComponent?: string;
  /** Optional target element to portal the content into. Overrides `instance.portalTarget`. */
  portalTarget?: HTMLElement;
  /** Event handler called when the Escape key is pressed. Can be prevented via `event.preventDefault()`. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Event handler called when a pointer down event occurs outside the hover card. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type HoverCardContentProps<T extends keyof SeidrElementTagNameMap = "div"> = HoverCardContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof HoverCardContentOptions<T>>;

export interface HoverCardPortalProps {
  /** Target element to portal into. Defaults to `instance.portalTarget ?? getDocument().body`. */
  target?: HTMLElement;
  instance?: UseHoverCardResult;
}

export type HoverCardArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperArrowProps<T>;

// ---------------------------------------------------------------------------
// Tier 2 Coordinator Instance Interface
// ---------------------------------------------------------------------------

export interface HoverCardInstance extends UseHoverCardResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<HoverCardRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Trigger: <T extends keyof SeidrElementTagNameMap = "a">(
    props?: Omit<HoverCardTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Portal: (props?: HoverCardPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;

  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<HoverCardContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<HoverCardArrowProps<T>, "instance">,
  ) => SeidrElementTagNameMap[T];
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Component Props
// ---------------------------------------------------------------------------

export interface HoverCardProps<T extends keyof SeidrElementTagNameMap = "div"> extends UseHoverCardOptions {
  /** Polymorphic tag name for the root wrapper. Defaults to `"div"`. */
  as?: T;
  /** Trigger element or label content. */
  trigger?: SeidrChild | SeidrChild[];
  /** Optional href for the trigger link. */
  href?: string;
  /** Optional target for the trigger link. */
  target?: string;
  /** Optional rel for the trigger link. */
  rel?: string;
  /** Whether the trigger is disabled. */
  disabled?: ReactiveValue<boolean>;
  /** HoverCard body content (can also be passed as `children`). */
  content?: SeidrChild | SeidrChild[];
  /** Whether to render a PopperArrow inside the hover card content. */
  showArrow?: boolean;
  /** Props forwarded to HoverCardRoot. */
  rootProps?: Omit<HoverCardRootProps<T>, "instance">;
  /** Props forwarded to HoverCardTrigger. */
  triggerProps?: Omit<HoverCardTriggerProps<"a">, "instance">;
  /** Props forwarded to HoverCardContent. */
  contentProps?: Omit<HoverCardContentProps<"div">, "instance">;
  /** Props forwarded to HoverCardArrow. */
  arrowProps?: Omit<HoverCardArrowProps<"div">, "instance">;
  /** Children rendered inside HoverCardContent (when `content` is not provided). */
  children?: SeidrChild | SeidrChild[];
}

