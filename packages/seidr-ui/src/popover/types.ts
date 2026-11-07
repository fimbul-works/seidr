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
import type {
  FocusOutsideEvent,
  InteractOutsideEvent,
  PointerDownOutsideEvent,
} from "../hooks/use-interact-outside.js";
import type { PopperArrowProps, UsePopperOptions, UsePopperResult } from "../popper/types.js";

export interface UsePopoverOptions extends Omit<UsePopperOptions, "anchorRef" | "contentRef"> {
  /** A unique id for the popover. */
  id?: string;

  /** Controlled open state. */
  open?: ObservableValue<boolean> | boolean;

  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;

  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the popover behaves as a modal.
   * When true:
   * - Focus is trapped within the popover.
   * - Scrolling is prevented.
   * - Outside content is hidden from screen readers.
   * Defaults to false.
   */
  modal?: boolean | ObservableValue<boolean>;

  /** Whether body scrolling is prevented when open. Defaults to modal value. */
  preventScroll?: boolean;

  /** Force mount the popover elements regardless of open state. */
  forceMount?: boolean;

  /** DOM element to portal the floating content into. */
  portalTarget?: HTMLElement;

  /** Optional external anchor ref or getter. Defaults to triggerRef. */
  anchorRef?: Ref<HTMLElement> | (() => HTMLElement | undefined);
}

export interface UsePopoverResult {
  /** The popover instance ID. */
  id: string;

  /** Reactive ID of the content element. */
  contentId: Value<string>;

  /** Reactive ID of the title element. */
  titleId: Value<string>;

  /** Reactive ID of the description element. */
  descriptionId: Value<string>;

  /** Whether the popover is currently open. */
  isOpen: DerivedValue<boolean>;

  /** Whether the popover is modal. */
  isModal: ObservableValue<boolean>;

  /** Whether to prevent scroll when open. */
  preventScroll: boolean;

  /** Ref to the trigger element. */
  triggerRef: Ref<HTMLElement>;

  /** Ref to the anchor element. */
  anchorRef: Ref<HTMLElement>;

  /** Ref to the content element. */
  contentRef: Ref<HTMLElement>;

  /** Popper coordinator instance. */
  popper: UsePopperResult;

  /** Whether elements should be force mounted. */
  forceMount: boolean;

  /** Target portal element if provided. */
  portalTarget?: HTMLElement;

  /** Opens the popover. */
  open: () => void;

  /** Closes the popover. */
  close: () => void;

  /** Toggles the open state of the popover. */
  toggle: () => void;
}

export interface PopoverRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
}

export type PopoverRootProps<T extends keyof SeidrElementTagNameMap = "div"> = PopoverRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverRootOptions<T>>;

export interface PopoverTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
  type?: "button" | "submit" | "reset";
  disabled?: ReactiveValue<boolean>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export type PopoverTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = PopoverTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverTriggerOptions<T>>;

export interface PopoverAnchorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
}

export type PopoverAnchorProps<T extends keyof SeidrElementTagNameMap = "div"> = PopoverAnchorOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverAnchorOptions<T>>;

export interface PopoverContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
  portalTarget?: HTMLElement;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type PopoverContentProps<T extends keyof SeidrElementTagNameMap = "div"> = PopoverContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverContentOptions<T>>;

export interface PopoverCloseButtonOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

export type PopoverCloseButtonProps<T extends keyof SeidrElementTagNameMap = "button"> = PopoverCloseButtonOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverCloseButtonOptions<T>>;

export interface PopoverTitleOptions<T extends keyof SeidrElementTagNameMap = "h2"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
}

export type PopoverTitleProps<T extends keyof SeidrElementTagNameMap = "h2"> = PopoverTitleOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverTitleOptions<T>>;

export interface PopoverDescriptionOptions<T extends keyof SeidrElementTagNameMap = "p"> {
  as?: T;
  instance?: UsePopoverResult;
  dataComponent?: string;
}

export type PopoverDescriptionProps<T extends keyof SeidrElementTagNameMap = "p"> = PopoverDescriptionOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopoverDescriptionOptions<T>>;

export interface PopoverPortalProps {
  portalTarget?: HTMLElement;
}

export interface PopoverInstance extends UsePopoverResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopoverRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<PopoverTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Anchor: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopoverAnchorProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopoverContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  CloseButton: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<PopoverCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Title: <T extends keyof SeidrElementTagNameMap = "h2">(
    props?: Omit<PopoverTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "p">(
    props?: Omit<PopoverDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopperArrowProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Portal: (
    props: PopoverPortalProps,
    children: SeidrChild | SeidrChild[],
  ) => SeidrChild | SeidrChild[];
}

export interface PopoverProps<T extends keyof SeidrElementTagNameMap = "div">
  extends UsePopoverOptions {
  as?: T;
  trigger?: SeidrChild | SeidrChild[];
  title?: SeidrChild | SeidrChild[];
  description?: SeidrChild | SeidrChild[];
  closeButton?: boolean | SeidrChild | SeidrChild[];
  content?: SeidrChild | SeidrChild[];
  showArrow?: boolean;
  rootProps?: Omit<PopoverRootProps<T>, "instance">;
  triggerProps?: Omit<PopoverTriggerProps<"button">, "instance">;
  anchorProps?: Omit<PopoverAnchorProps<"div">, "instance">;
  contentProps?: Omit<PopoverContentProps<"div">, "instance">;
  titleProps?: Omit<PopoverTitleProps<"h2">, "instance">;
  descriptionProps?: Omit<PopoverDescriptionProps<"p">, "instance">;
  closeButtonProps?: Omit<PopoverCloseButtonProps<"button">, "instance">;
  arrowProps?: Omit<PopperArrowProps<"div">, "instance">;
  children?: SeidrChild | SeidrChild[];
}
