import {
  type DerivedValue,
  isServer,
  Portal as createSeidrPortal,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { DialogCloseButton } from "./dialog-close-button.js";
import { DialogContent } from "./dialog-content.js";
import { DialogDescription } from "./dialog-description.js";
import { DialogOverlay } from "./dialog-overlay.js";
import { DialogRoot } from "./dialog-root.js";
import { DialogTitle } from "./dialog-title.js";
import { DialogTrigger } from "./dialog-trigger.js";
import type {
  DialogCloseButtonProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogInstance,
  DialogOverlayProps,
  DialogPortalProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
  UseDialogProps,
} from "./types.js";
import { useDialog } from "./use-dialog.js";

/**
 * Creates a fine-grained Dialog coordinator with pre-bound compound element helpers (Tier 2).
 */
export function createDialog(options: UseDialogProps = {}): DialogInstance {
  const instance = useDialog(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<DialogRootProps<T>, "instance"> = {} as Omit<DialogRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogRoot<T>({ instance, ...props } as DialogRootProps<T>, children);

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<DialogTriggerProps<T>, "instance"> = {} as Omit<DialogTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogTrigger<T>({ instance, ...props } as DialogTriggerProps<T>, children);

  const Overlay = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<DialogOverlayProps<T>, "instance"> = {} as Omit<DialogOverlayProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogOverlay<T>({ instance, ...props } as DialogOverlayProps<T>, children);

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<DialogContentProps<T>, "instance"> = {} as Omit<DialogContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    DialogContent<T>({ instance, ...props } as DialogContentProps<T>, children);

  const CloseButton = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<DialogCloseButtonProps<T>, "instance"> = {} as Omit<DialogCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogCloseButton<T>({ instance, ...props } as DialogCloseButtonProps<T>, children);

  const Title = <T extends keyof SeidrElementTagNameMap = "h2">(
    props: Omit<DialogTitleProps<T>, "instance"> = {} as Omit<DialogTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogTitle<T>({ instance, ...props } as DialogTitleProps<T>, children);

  const Description = <T extends keyof SeidrElementTagNameMap = "p">(
    props: Omit<DialogDescriptionProps<T>, "instance"> = {} as Omit<DialogDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    DialogDescription<T>({ instance, ...props } as DialogDescriptionProps<T>, children);

  const Portal = (
    portalProps: DialogPortalProps = {},
    children?: SeidrChild | SeidrChild[],
  ): SeidrChild => {
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
    return createSeidrPortal(target, () => children, "DialogPortal");
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
