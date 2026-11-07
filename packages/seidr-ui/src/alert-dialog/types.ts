import type {
  DerivedValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type {
  DialogCloseButtonOptions,
  DialogContentOptions,
  DialogDescriptionOptions,
  DialogInstance,
  DialogOverlayOptions,
  DialogPortalProps,
  DialogRootOptions,
  DialogTitleOptions,
  DialogTriggerOptions,
  UseDialogProps,
  UseDialogResult,
} from "../dialog/types.js";

export interface UseAlertDialogProps extends Omit<UseDialogProps, "closeOnOutsideClick"> {
  /**
   * Whether clicking outside the dialog content closes it.
   * Defaults to `false` for AlertDialog to prevent accidental dismissal during critical user confirmations.
   */
  closeOnOutsideClick?: boolean;
}

export interface UseAlertDialogResult extends UseDialogResult {}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface AlertDialogRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends DialogRootOptions<T> {}

export type AlertDialogRootProps<T extends keyof SeidrElementTagNameMap = "div"> = AlertDialogRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogRootOptions<T>>;

export interface AlertDialogTriggerOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends DialogTriggerOptions<T> {}

export type AlertDialogTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = AlertDialogTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogTriggerOptions<T>>;

export interface AlertDialogOverlayOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends DialogOverlayOptions<T> {}

export type AlertDialogOverlayProps<T extends keyof SeidrElementTagNameMap = "div"> = AlertDialogOverlayOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogOverlayOptions<T>>;

export interface AlertDialogContentOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends Omit<DialogContentOptions<T>, "role"> {
  role?: "alertdialog";
}

export type AlertDialogContentProps<T extends keyof SeidrElementTagNameMap = "div"> = AlertDialogContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogContentOptions<T>>;

export interface AlertDialogCloseButtonOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends DialogCloseButtonOptions<T> {}

export type AlertDialogCloseButtonProps<T extends keyof SeidrElementTagNameMap = "button"> =
  AlertDialogCloseButtonOptions<T> & Omit<SeidrElementProps<T>, keyof AlertDialogCloseButtonOptions<T>>;

export interface AlertDialogTitleOptions<T extends keyof SeidrElementTagNameMap = "h2">
  extends DialogTitleOptions<T> {}

export type AlertDialogTitleProps<T extends keyof SeidrElementTagNameMap = "h2"> = AlertDialogTitleOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogTitleOptions<T>>;

export interface AlertDialogDescriptionOptions<T extends keyof SeidrElementTagNameMap = "p">
  extends DialogDescriptionOptions<T> {}

export type AlertDialogDescriptionProps<T extends keyof SeidrElementTagNameMap = "p"> = AlertDialogDescriptionOptions<T> &
  Omit<SeidrElementProps<T>, keyof AlertDialogDescriptionOptions<T>>;

export interface AlertDialogPortalProps extends DialogPortalProps {}

export interface AlertDialogInstance extends UseAlertDialogResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<AlertDialogRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<AlertDialogTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Overlay: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<AlertDialogOverlayProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<AlertDialogContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  CloseButton: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<AlertDialogCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Title: <T extends keyof SeidrElementTagNameMap = "h2">(
    props?: Omit<AlertDialogTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "p">(
    props?: Omit<AlertDialogDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Portal: (props?: AlertDialogPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One AlertDialog Props
// ---------------------------------------------------------------------------

export interface AlertDialogProps<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
> extends UseAlertDialogProps {
  as?: TRoot;
  dataComponent?: string;
  /** Trigger button label or custom element. */
  trigger?: SeidrChild | SeidrChild[];
  /** Props forwarded to the trigger button. */
  triggerProps?: AlertDialogTriggerProps<TTrigger>;
  /** Title text or custom element for the alert dialog. */
  title?: SeidrChild | SeidrChild[];
  /** Props forwarded to the alert dialog title element. */
  titleProps?: AlertDialogTitleProps<"h2">;
  /** Optional description text or custom element for the alert dialog. */
  description?: SeidrChild | SeidrChild[];
  /** Props forwarded to the alert dialog description element. */
  descriptionProps?: AlertDialogDescriptionProps<"p">;
  /** Dialog content body. */
  content: SeidrChild | SeidrChild[];
  /** Props forwarded to the alert dialog content container. */
  contentProps?: AlertDialogContentProps<TContent>;
  /** Whether to render a backdrop overlay. Defaults to true. */
  overlay?: boolean;
  /** Props forwarded to the alert dialog overlay backdrop element. */
  overlayProps?: AlertDialogOverlayProps<"div">;
  /** Close button text, icon, or custom element. Defaults to "✕". Set to false to omit. */
  closeButton?: SeidrChild | SeidrChild[] | boolean;
  /** Props forwarded to the close button element. */
  closeButtonProps?: AlertDialogCloseButtonProps<"button">;
}

