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
import type { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from "../hooks/use-interact-outside.js";

export interface UseDialogProps {
  /** Explicit identifier for the dialog instance. Defaults to auto-generated ID. */
  id?: string;
  /** Whether the dialog is initially open in uncontrolled mode. Defaults to false. */
  defaultOpen?: boolean;
  /** Controlled open state observable. */
  open?: Value<boolean>;
  /** Callback invoked when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether the dialog is modal. Traps focus and locks page scrolling. Defaults to true. */
  isModal?: boolean;
  /** Whether clicking outside the dialog content closes it. Defaults to true. */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the dialog. Defaults to true. */
  closeOnEscapeKeyDown?: boolean;
  /** Whether body scrolling is prevented while open. Defaults to true when modal. */
  preventScroll?: boolean;
  /** Whether to portal the overlay and content. Defaults to true. */
  portal?: boolean;
  /** Target element to portal the overlay and content into. Defaults to document.body. */
  portalTarget?: HTMLElement;
}

export interface UseDialogResult {
  /** Unique identifier of this dialog instance. */
  id: string;
  /** Read-only observable indicating whether the dialog is currently open. */
  isOpen: DerivedValue<boolean>;
  /** Read-only observable indicating whether the dialog operates in modal mode. */
  isModal: DerivedValue<boolean>;
  /** Whether clicking outside the dialog content closes it. */
  closeOnOutsideClick: boolean;
  /** Whether body scroll locking is enabled while the dialog is open. */
  preventScroll: DerivedValue<boolean>;
  /** Whether portaling is enabled. */
  portal: boolean;
  /** Target container element for portaled overlay and content. */
  portalTarget?: HTMLElement;
  /** Unique ID for the dialog content element. */
  contentId: DerivedValue<string>;
  /** Unique ID for the dialog title element. */
  titleId: DerivedValue<string>;
  /** Unique ID for the dialog description element. */
  descriptionId: DerivedValue<string>;
  /** Reference to the trigger button/element. */
  triggerRef: Ref<HTMLElement>;
  /** Reference to the overlay backdrop element. */
  overlayRef: Ref<HTMLElement>;
  /** Reference to the dialog content element. */
  contentRef: Ref<HTMLElement>;
  /** Opens the dialog. */
  open: () => void;
  /** Closes the dialog. */
  close: () => void;
  /** Toggles the open state of the dialog. */
  toggle: () => void;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface DialogRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
}

export type DialogRootProps<T extends keyof SeidrElementTagNameMap = "div"> = DialogRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogRootOptions<T>>;

export interface DialogTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
  type?: "button" | "submit" | "reset";
  disabled?: ReactiveValue<boolean>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export type DialogTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = DialogTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogTriggerOptions<T>>;

export interface DialogOverlayOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
}

export type DialogOverlayProps<T extends keyof SeidrElementTagNameMap = "div"> = DialogOverlayOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogOverlayOptions<T>>;

export interface DialogContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
  role?: "dialog" | "alertdialog";
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

export type DialogContentProps<T extends keyof SeidrElementTagNameMap = "div"> = DialogContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogContentOptions<T>>;

export interface DialogCloseButtonOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

export type DialogCloseButtonProps<T extends keyof SeidrElementTagNameMap = "button"> = DialogCloseButtonOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogCloseButtonOptions<T>>;

export interface DialogTitleOptions<T extends keyof SeidrElementTagNameMap = "h2"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
}

export type DialogTitleProps<T extends keyof SeidrElementTagNameMap = "h2"> = DialogTitleOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogTitleOptions<T>>;

export interface DialogDescriptionOptions<T extends keyof SeidrElementTagNameMap = "p"> {
  as?: T;
  instance?: UseDialogResult;
  dataComponent?: string;
}

export type DialogDescriptionProps<T extends keyof SeidrElementTagNameMap = "p"> = DialogDescriptionOptions<T> &
  Omit<SeidrElementProps<T>, keyof DialogDescriptionOptions<T>>;

export interface DialogPortalProps {
  /** Whether portaling is enabled. Defaults to true. */
  portal?: boolean;
  /** Target element to portal into. Defaults to document.body. */
  target?: HTMLElement;
}

export interface DialogInstance extends UseDialogResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<DialogRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<DialogTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Overlay: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<DialogOverlayProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<DialogContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  CloseButton: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<DialogCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Title: <T extends keyof SeidrElementTagNameMap = "h2">(
    props?: Omit<DialogTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "p">(
    props?: Omit<DialogDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Portal: (props?: DialogPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Dialog Props
// ---------------------------------------------------------------------------

export interface DialogProps<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
> extends UseDialogProps {
  as?: TRoot;
  dataComponent?: string;
  /** Trigger button label or custom element. */
  trigger?: SeidrChild | SeidrChild[];
  /** Props forwarded to the trigger button. */
  triggerProps?: DialogTriggerProps<TTrigger>;
  /** Title text or custom element for the dialog. */
  title?: SeidrChild | SeidrChild[];
  /** Props forwarded to the dialog title element. */
  titleProps?: DialogTitleProps<"h2">;
  /** Optional description text or custom element for the dialog. */
  description?: SeidrChild | SeidrChild[];
  /** Props forwarded to the dialog description element. */
  descriptionProps?: DialogDescriptionProps<"p">;
  /** Dialog content body. */
  content: SeidrChild | SeidrChild[];
  /** Props forwarded to the dialog content container. */
  contentProps?: DialogContentProps<TContent>;
  /** Whether to render a backdrop overlay. Defaults to true. */
  overlay?: boolean;
  /** Props forwarded to the dialog overlay backdrop element. */
  overlayProps?: DialogOverlayProps<"div">;
  /** Close button text, icon, or custom element. Defaults to "✕". Set to false to omit. */
  closeButton?: SeidrChild | SeidrChild[] | boolean;
  /** Props forwarded to the close button element. */
  closeButtonProps?: DialogCloseButtonProps<"button">;
}
