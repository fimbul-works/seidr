import {
  Portal as createSeidrPortal,
  type DerivedValue,
  isServer,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_ALERT_DIALOG } from "../constants.js";
import { DialogCloseButton } from "../dialog/dialog-close-button.js";
import { DialogContent } from "../dialog/dialog-content.js";
import { DialogDescription } from "../dialog/dialog-description.js";
import { DialogOverlay } from "../dialog/dialog-overlay.js";
import { DialogRoot } from "../dialog/dialog-root.js";
import { DialogTitle } from "../dialog/dialog-title.js";
import { DialogTrigger } from "../dialog/dialog-trigger.js";
import type {
  AlertDialogCloseButtonProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogInstance,
  AlertDialogOverlayProps,
  AlertDialogPortalProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
  UseAlertDialogProps,
} from "./types.js";
import { useAlertDialog } from "./use-alert-dialog.js";

/**
 * Creates a fine-grained AlertDialog coordinator with pre-bound compound element helpers (Tier 2).
 */
export function createAlertDialog(options: UseAlertDialogProps = {}): AlertDialogInstance {
  const instance = useAlertDialog(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<AlertDialogRootProps<T>, "instance"> = {} as Omit<AlertDialogRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogRoot<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<AlertDialogTriggerProps<T>, "instance"> = {} as Omit<AlertDialogTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogTrigger<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Overlay = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<AlertDialogOverlayProps<T>, "instance"> = {} as Omit<AlertDialogOverlayProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogOverlay<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<AlertDialogContentProps<T>, "instance"> = {} as Omit<AlertDialogContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogContent<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        role: "alertdialog",
        ...props,
      } as any,
      children,
    );

  const CloseButton = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<AlertDialogCloseButtonProps<T>, "instance"> = {} as Omit<AlertDialogCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogCloseButton<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Title = <T extends keyof SeidrElementTagNameMap = "h2">(
    props: Omit<AlertDialogTitleProps<T>, "instance"> = {} as Omit<AlertDialogTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogTitle<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Description = <T extends keyof SeidrElementTagNameMap = "p">(
    props: Omit<AlertDialogDescriptionProps<T>, "instance"> = {} as Omit<AlertDialogDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogDescription<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as any,
      children,
    );

  const Portal = (portalProps: AlertDialogPortalProps = {}, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    if (portalProps.portal === false || instance.portal === false) {
      return children as SeidrChild;
    }
    if (isServer()) {
      return children as SeidrChild;
    }
    const doc = typeof document !== "undefined" ? document : undefined;
    const target = portalProps.target ?? instance.portalTarget ?? doc?.body;
    if (!target) {
      return children as SeidrChild;
    }
    return createSeidrPortal(target, () => children, "AlertDialogPortal");
  };

  return {
    ...instance,
    Root,
    Trigger,
    Overlay,
    Content,
    CloseButton,
    Title,
    Description,
    Portal,
  };
}
