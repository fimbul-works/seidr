import {
  Portal as createSeidrPortal,
  type DerivedValue,
  getDocument,
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
  DialogCloseButtonProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "../dialog/types.js";
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
    props = {} as Omit<AlertDialogRootProps<T>, "instance">,
    children?: SeidrChild,
  ): SeidrElementTagNameMap[T] =>
    DialogRoot<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogRootProps<T>,
      children,
    );

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props = {} as Omit<AlertDialogTriggerProps<T>, "instance">,
    children?: SeidrChild,
  ): SeidrElementTagNameMap[T] =>
    DialogTrigger<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogTriggerProps<T>,
      children,
    );

  const Overlay = <T extends keyof SeidrElementTagNameMap = "div">(
    props = {} as Omit<AlertDialogOverlayProps<T>, "instance">,
    children?: SeidrChild,
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogOverlay<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogOverlayProps<T>,
      children,
    );

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props = {} as Omit<AlertDialogContentProps<T>, "instance">,
    children?: SeidrChild,
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogContent<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        role: "alertdialog",
        ...props,
      } as DialogContentProps<T>,
      children,
    );

  const CloseButton = <T extends keyof SeidrElementTagNameMap = "button">(
    props = {} as Omit<AlertDialogCloseButtonProps<T>, "instance">,
    children?: SeidrChild,
  ): SeidrElementTagNameMap[T] =>
    DialogCloseButton<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogCloseButtonProps<T>,
      children,
    );

  const Title = <T extends keyof SeidrElementTagNameMap = "h2">(
    props = {} as Omit<AlertDialogTitleProps<T>, "instance">,
    children?: SeidrChild,
  ): SeidrElementTagNameMap[T] =>
    DialogTitle<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogTitleProps<T>,
      children,
    );

  const Description = <T extends keyof SeidrElementTagNameMap = "p">(
    props = {} as Omit<AlertDialogDescriptionProps<T>, "instance">,
    children?: SeidrChild,
  ): SeidrElementTagNameMap[T] =>
    DialogDescription<T>(
      {
        instance,
        dataComponent: DATA_COMPONENT_ALERT_DIALOG,
        ...props,
      } as DialogDescriptionProps<T>,
      children,
    );

  const Portal = (portalProps: AlertDialogPortalProps = {}, children?: SeidrChild): SeidrChild => {
    if (portalProps.portal === false || instance.portal === false || isServer()) {
      return children;
    }
    const target = portalProps.target ?? instance.portalTarget ?? getDocument().body;
    if (!target) {
      return children;
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
